function eventDispatcher () {
  var events = {};

  return function getOrCreate (name) {
    if (!events[name]) {
      events[name] = {};
    }
    eventStore = events[name];
    return {
      eventStore: eventStore,
      register: function register (eventName, callback) {
        if (!this.eventStore[eventName]) {
          this.eventStore[eventName] = [];
        }
        if (typeof callback === 'function') {
          this.eventStore[eventName].push(callback);
        }
      },
      fire: function fire (eventName, args) {
        if (!this.eventStore[eventName]) return;
        this.eventStore[eventName].map(function (callback) {
          if (typeof callback === 'function') {
            callback(args);
          }
        });
      },
    };
  };
}

window.eventDispatcher = eventDispatcher();

function dataStore () {
  var store = {
    totalCount: 0,
    primary: [],
    cache: [],
  };
  var filterOptions = {
    query: '',
    properties: [],
  };
  var limitOptions = {
    limit: 10,
    offset: 0,
  };

  var sortOptions = {
    property: 'id',
    direction: 1,
    type: 'number',
  };

  function set (data) {
    store.primary = data;
  }

  function push (item) {
    store.primary.push(item);
    generateCache();
  }

  function setFilter (query, properties) {
    var newFilterOptions = {
      query: query,
      properties: properties,
    };
    filterOptions = Object.assign({}, filterOptions, newFilterOptions);
    return this;
  }

  function setLimit (limit, offset) {
    var newLimitOptions = {
      limit: limit,
      offset: offset,
    };
    limitOptions = Object.assign({}, limitOptions, newLimitOptions);
    return this;
  }

  function getSorter (type) {
    switch (type) {
      case 'number':
        return function (a, b) {
          return a > b ? 1 : -1;
        };
      case 'date':
        return function (a, b) {
          return (new Date(a)).getTime() > (new Date(b)).getTime() ? 1 : -1;
        };
      default:
      case 'string':
        return function (a, b) {
          return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
        };
    }
  }

  function setSort (property, direction, type) {
    type = type || 'string';
    direction = direction || 1;
    var newSortOptions = {
      property: property,
      direction: direction,
      type: type,
    };
    sortOptions = Object.assign({}, sortOptions, newSortOptions);
    generateCache();
    return this;
  }

  function generateCache () {
    var sorter = getSorter(sortOptions.type);
    store.cache = store.primary.sort(function (a, b) {
      return sorter(getProp(a, sortOptions.property), getProp(b, sortOptions.property)) * sortOptions.direction;
    });
  }

  function get () {
    var retData = !store.cache.length ? store.primary : store.cache;
    store.totalCount = retData.length;

    function test (obj, fields, needle) {
      var status = false;
      var statuses = fields.map(function (path) {
        return getProp(obj, path).toLowerCase().indexOf(needle.toLowerCase()) > -1;
      });
      status = statuses.reduce(function (a, b) {
        return a || b;
      }, status);
      return status;
    }

    retData = retData.filter(function (item, idx) {
      if (!filterOptions.query || !filterOptions.properties) { return item; }
      return test(item, filterOptions.properties, filterOptions.query);
    });

    store.totalCount = retData.length;

    retData = retData.slice(limitOptions.offset, (limitOptions.offset + limitOptions.limit));

    return retData;
  }

  function getTotal () {
    return store.totalCount;
  }

  return {
    filter: setFilter,
    limit: setLimit,
    sort: setSort,
    get: get,
    set: set,
    push: push,
    getTotal: getTotal,
  };
}

window.ds = dataStore();

function paginationObject () {

  var page = 0;
  var pageCount = -1;
  var countPerPage = 10;
  var totalCount = -1;
  var selectElement;
  var ed = window.eventDispatcher('flightTable');

  var configuration = {
    _containerClass: 'pagi-cont',
    _itemClass: 'pagi-item',
    containerElement: 'ul',
    itemElement: 'li',
    hideInMiddle: true,
    itemsPerPage: countPerPage,
  };

  function total (val) {
    val = parseInt(val, 10);
    if (val === totalCount) { return; }
    totalCount = val;
    pageCount = Math.ceil(val / countPerPage);
    updateSelect();
    return totalCount;
  }

  function nextPage (by) {
    var npage = page;
    if ((npage + by) >= pageCount) {
      npage = pageCount - 1;
    } else {
      npage += by;
    }
    selectPage(npage);
  }

  function prevPage (by) {
    var npage = page;
    if ((npage - by) < 0) {
      npage = 0;
    } else {
      npage -= by;
    }
    selectPage(npage);
  }

  function firstPage () {
    selectPage(0);
  }

  function lastPage () {
    selectPage(pageCount - 1);
  }

  function selectPage (pageNumber) {
    pageNumber = parseInt(pageNumber, 10);
    if (pageNumber > -1) {
      page = pageNumber;
    }
    if (selectElement) {
      selectElement.value = pageNumber;
    }
    ed.fire('onPageChange', {offset: page * countPerPage});
  }

  function getCurrentPage () {
    return page;
  }

  function itemsPerPage () {
    return configuration.itemsPerPage;
  }

  function createAnchor (text, callbackOnClick) {
    var li = jshp.create('li'),
      a = jshp.create('a');
    jshp.addClass(li, configuration._itemClass);
    jshp.attr(a, 'href', '#');
    jshp.text(a, text);
    jshp.append(a, li);
    jshp.on(a, 'click', callbackOnClick);
    return li;
  }

  function createSelect () {
    var li = jshp.create('li');
    jshp.addClass(li, configuration._itemClass);
    jshp.addClass(li, 'select-item');
    selectElement = jshp.create('select');
    jshp.attr(selectElement, 'name', 'pageNumber');
    jshp.on(selectElement, 'change', function (event) {
      event.preventDefault();
      selectPage(event.target.value);
    });
    Array.apply(null, Array(pageCount)).map(function (_, idx) {
      var optionElement = jshp.create('option');
      jshp.attr(optionElement, 'value', idx);
      jshp.text(optionElement, idx + 1);
      jshp.append(optionElement, selectElement);
    });
    jshp.append(selectElement, li);
    return li;
  }

  function updateSelect () {
    var si = jshp.get('.select-item');
    if (si.length) {
      si = si[0];
      jshp.empty(si);
      var se = createSelect();
      jshp.append(se, si);
      selectPage(0);
    }
  }

  function render (target) {
    var row = jshp.create('tr');
    var cell = jshp.create('td');
    jshp.attr(cell, 'colspan', '10');

    var container = jshp.create(configuration.containerElement);
    jshp.addClass(container, configuration._containerClass);
    var firstPageItem = createAnchor('<<', function (event) {
      event.preventDefault();
      firstPage();
    });
    var lastPageItem = createAnchor('>>', function (event) {
      event.preventDefault();
      lastPage();
    });
    var prevPageItem = createAnchor('<', function (event) {
      event.preventDefault();
      prevPage(1);
    });
    var nextPageItem = createAnchor('>', function (event) {
      event.preventDefault();
      nextPage(1);
    });
    var selectElementItem = createSelect();
    //
    jshp.append(firstPageItem, container);
    jshp.append(prevPageItem, container);
    //
    jshp.append(selectElementItem, container);
    //
    jshp.append(nextPageItem, container);
    jshp.append(lastPageItem, container);
    //
    jshp.append(container, cell);
    jshp.append(cell, row);
    jshp.append(row, target);
  }

  return {
    total: total,
    current: getCurrentPage,
    itemsPerPage: itemsPerPage,
    next: nextPage,
    prev: prevPage,
    select: selectPage,
    render: render,
  };
}

function tableObject (config) {
  var data = [];

  var columns = config.columns;
  var tbody = jshp.get(config.tbody)[0];
  var thead = jshp.get(config.thead)[0];
  var tfoot = jshp.get(config.tfoot)[0];

  var ed = window.eventDispatcher('flightTable');

  var po = config.pagination;

  function init () {
    jshp.empty(thead);
    var tr = jshp.create('tr');
    columns.map(function (column) {
      var th = jshp.create('th');
      if (column.sortable) {
        var link = jshp.create('a');
        jshp.text(link, column.title);
        jshp.attr(link, 'href', '#');
        jshp.on(link, 'click', function (event) {
          event.preventDefault();
          direction = parseInt(jshp.data(event.target, 'direction')) || -1;
          direction *= -1;
          ed.fire('onSortingChange', {
            type: column.type,
            prop: column.target,
            direction: direction,
          });
          jshp.data(event.target, 'direction', direction);
        });
        jshp.append(link, th);
      } else {
        jshp.text(th, column.title);
      }

      jshp.append(th, tr);
    });
    jshp.addClass(tr, 'table-head');
    jshp.append(tr, thead);
    initModal();
    po.total(1);
    po.render(tfoot);
  }

  init();

  function initModal () {
    var _airports, _airlines;
    var modal = jshp.get('#modal')[0];
    jshp.addListener(jshp.get('#addFlight')[0], 'click', function () {
      jshp.css(modal, 'display', 'block');
      jshp.ajaxGet({url: '/airports'}, function (data) {
        _airports = data;
        var ports = data.map(function (a) {
          return Object.assign({}, a, {name: a.city + ' [' + a.IAA + ']'});
        });
        insertOptions('dept_city', ports);
        insertOptions('arrival_city', ports);
      }, errorHandler);
      jshp.ajaxGet({url: '/airlines'}, function (data) {
        _airlines = data;
        insertOptions('airline', _airlines);
      }, errorHandler);
    });

    jshp.addListener(jshp.get('span.close')[0], 'click', function () {
      jshp.css(modal, 'display', 'none');
    });

    Array.prototype.forEach.call(jshp.get('button.time'), function (button) {
      jshp.addListener(button, 'click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        var elem = jshp.get('input[name="' + jshp.getAttr(this, 'data-for') + '"]')[0];
        elem.value = formatDate(new Date().toISOString());
      });
    });

    jshp.addListener(jshp.get('#modal .submit')[0], 'click', function (event) {
      Array.prototype.forEach.call(jshp.get('#modal .error'), function (elem) {
        jshp.removeClass(elem, 'error');
      });
      event.stopPropagation();
      event.preventDefault();
      var airline = _getSelectedValue('select[name="airline"]', _airlines);
      var departure = Object.assign({}, _getSelectedValue('select[name="dept_city"]', _airports));
      var arrival = Object.assign({}, _getSelectedValue('select[name="arrival_city"]', _airports));
      var error = false;
      if (departure.id === arrival.id) {
        jshp.addClass(jshp.get('select[name="dept_city"]')[0], 'error');
        jshp.addClass(jshp.get('select[name="arrival_city"]')[0], 'error');
        error = true;
      }

      var dept_time = jshp.get('input[name="dept_time"]')[0];
      if (!dept_time.value) {
        jshp.addClass(dept_time, 'error');
        error = true;
      } else {
        departure.time = dept_time.value;
      }

      var arrival_time = jshp.get('input[name="arrival_time"]')[0];
      if (!arrival_time.value) {
        jshp.addClass(arrival_time, 'error');
        error = true;
      } else {
        arrival.time = arrival_time.value;
      }

      if (error) { return !error; }

      var payload = {airline: airline, departure: departure, arrival: arrival};
      jshp.ajaxPost({url: '/flights', data: payload}, function (response) {
        jshp.css(modal, 'display', 'none');
        ds.push(response);
        updateTable(ds.get(), ds.getTotal());
      }, errorHandler);
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  function _getSelectedValue (name, data) {
    var element = jshp.get(name)[0];
    return data.filter(function (a) {
      return a.id === parseInt(element.options[element.selectedIndex].value, 10);
    })[0];
  }

  function insertOptions (name, options) {
    var selectElement = jshp.get('select[name=' + name + ']')[0];
    options.map(function (option) {
      var optionElement = jshp.create('option');
      jshp.attr(optionElement, 'value', option.id);
      jshp.text(optionElement, option.name);
      jshp.append(optionElement, selectElement);
    });
  }

  function insertRow (item) {
    var tr = jshp.create('tr');
    for (var i = 0, len = columns.length; i < len; i++) {
      var td = jshp.create('td');
      if (typeof columns[i].script === 'function') {
        var text = columns[i].script(getProp(item, columns[i].target));
        jshp.text(td, text);
      } else {
        jshp.text(td, getProp(item, columns[i].target));
      }
      if (columns[i].className) {
        jshp.addClass(td, columns[i].className);
      }
      for (var attr in columns[i].attrs) {
        var attrValue = getProp(item, columns[i].attrs[attr]);
        jshp.setAttr(td, attr, attrValue);
      }
      jshp.append(td, tr);
    }
    jshp.append(tr, tbody);
  }

  function updateTable (newData, total) {
    jshp.empty(tbody);
    newData.map(function (item) {
      insertRow(item);
    });
    po.total(total);
  }

  return {
    updateTable: updateTable,
  };
}

function errorHandler (error) {
  console.error(error);
}

function getProp (obj, path) {
  return path.split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : undefined;
  }, obj);
}

function formatDate (input) {
  if (!(input instanceof Date)) {
    input = new Date(input);
  }
  function formatWithZero (value) {
    return value > 9 ? value : '0' + value;
  }

  var year = input.getFullYear();
  var month = formatWithZero(input.getMonth());
  var day = formatWithZero(input.getDate());
  var hours = formatWithZero(input.getHours());
  var minutes = formatWithZero(input.getMinutes());
  var seconds = formatWithZero(input.getSeconds());
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

jshp.ready(function () {
  var bounce = null;
  var ed = window.eventDispatcher('flightTable');
  var ds = window.ds;
  var po = paginationObject();

  var tableConfig = {
    table: '.table',
    thead: '.thead',
    tbody: '.table-body',
    tfoot: '.tfoot',
    pagination: po,
    columns: [
      {
        title: '#',
        type: 'number',
        sortable: true,
        target: 'id',
        className: 'bold',
      }, {
        title: 'Departure city',
        type: 'string',
        target: 'departure.city',
        className: 'departure',
        attrs: {id: 'departure.id'},
      }, {
        title: 'Departure time',
        type: 'date',
        target: 'departure.time',
        script: function (value) {
          return formatDate(value);
        },
        sortable: true,
      }, {
        title: 'Arrival city',
        type: 'string',
        target: 'arrival.city',
        className: 'arrival',
        attrs: {id: 'arrival.id'},
      }, {
        title: 'Arrival time',
        type: 'date',
        target: 'arrival.time',
        script: function (value) {
          return formatDate(value);
        },
        sortable: true,
      }, {
        title: 'Airline',
        type: 'string',
        target: 'airline.name',
      },
    ],
    events: {
      'td.arrival, td.departure': {
        click: function (event) {
          window.location = '//localhost:3000/airports/' + jshp.getAttr(event.target, 'id');
        },
      },
    },
  };

  ed.register('onPageChange', function (data) {
    to.updateTable(
      ds.limit(10, data.offset).get(), ds.getTotal()
    );
  });

  ed.register('onSortingChange', function (data) {
    to.updateTable(
      ds.sort(data.prop, data.direction, data.type).get(), ds.getTotal()
    );
  });

  var filterFields = ['departure.city', 'arrival.city', 'airline.name'];
  var to = tableObject(tableConfig);

  jshp.ajaxGet({
    url: '//localhost:3000/flights',
  }, function (data) {
    ds.set(data);
    to.updateTable(ds.get(), ds.getTotal());

    var elems = jshp.get('td.arrival, td.departure');
    for (var i = 0; i < elems.length; i++) {
      var elem = elems[i];
      jshp.on(elem, 'click', function () {
        window.location = '//localhost:3000/airports/' + jshp.getAttr(this, 'id');
      });
    }
  }, errorHandler);

  var queryElement = jshp.get('.table-query')[0];
  jshp.on(queryElement, 'keydown', function (event) {
    if (bounce) {
      clearTimeout(bounce);
      bounce = null;
    }
    bounce = setTimeout(function () {
      bounce = null;
      to.updateTable(
        ds.filter(event.target.value, filterFields).get(),
        ds.getTotal()
      );
    }, 500);
  });
});
