var faker = require('faker');

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * @param {number} min - minimal value to be found, default 1
 * @param {number} max - maximal value to be found, default 10
 */
function getRandomArbitrary (min=1, max=9) {
  return Math.round(Math.random() * (max - min) + min);
}

function generateData () {
  var airlines = [],
      flights = [],
      airports = [];
  var id;

  for (id = 1; id <= 10; id++) {
    airlines.push({
      id: id,
      name: faker.company.companyName(),
    });
  }

  for (id = 1; id <= 30; id++) {
    var city = faker.address.city();
    airports.push({
      id: id,
      city: city,
      IAA: city.substring(0, 3).toUpperCase(),
    });
  }

  for (id = 1; id <= 16; id++) {
    var departure = airports[getRandomArbitrary()];
    departure.time = faker.date.future();

    do {
      // find arrival different than departure
      var arrival = airports[getRandomArbitrary()];
    } while (arrival.id === departure.id);
    arrival.time = faker.date.future();

    flights.push({
      id: id,
      airline: airlines[getRandomArbitrary()],
      number: faker.random.number,
      departure: departure,
      arrival: arrival,
    });
  }

  return {airports: airports, airlines: airlines, flights: flights};
}

// json-server requires that you export
// a function which generates the data set
module.exports = generateData;
