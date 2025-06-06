const { sql, config } = require("./ConnectToDb");
const { generateData } = require("./GenerateData");
const { insertData } = require("./InsertData");
const {
  AgeRestrictions,
  HallTechnologies,
  ScreeningFormats,
  PaymentMethods,
  Cities,
  CinemaNames,
  ProductTypes,
  DeliveryOrderStatuses,
  EmployeePositions,
  SeatCategories,
} = require("./Classifiers");

sql.connect(config, async function (err) {
  if (err) {
    console.log("Connection error: ", err);
    return;
  }
  console.log("Successfully connected to the database!");
  console.log("Connection string =", config.connectionString);

  try {
    const cinemas = [];
    const halls = [];
    const employees = [];
    const employeePositions = [];
    const movies = [];
    const runs = [];
    const screenings = [];
    const seats = [];
    const clients = [];
    const tickets = [];
    const checkTickets = [];
    const checks = [];
    const moviesGenres = [];

    const Languages = [];
    const Publishers = [];
    const Countries = [];
    const Genres = [];
    const MovieGenres = [];

    async function runGeneration() {
      console.log("Before generateData call:");

      const {
        cinemas: updatedCinemas,
        halls: updatedHalls,
        employees: updatedEmployees,
        movies: updatedMovies,
        runs: updatedRuns,
        screenings: updatedScreenings,
        seats: updatedSeats,
        clients: updatedClients,
        tickets: updatedTickets,
        checkTickets: updatedCheckTickets,
        checks: updatedChecks,
        moviesGenres: updatedMoviesGenres,
        screeningPrices,

        suppliers,
        deliveryOrders,
        products,
        productsInStorage,
        productsInOrder,
        productPlacements,
        productChecks,
        productCheckDetails,
      } = await generateData(
        cinemas,
        halls,
        employees,
        movies,
        runs,
        screenings,
        seats,
        clients,
        tickets,
        checkTickets,
        checks,
        moviesGenres,
        Languages,
        Publishers,
        Countries,
        Genres,
        MovieGenres,
        ScreeningFormats // <= цього параметра бракувало у тебе при виклику!
      );

      console.log("After generateData call:");

      // Очистка і заповнення масивів
      cinemas.length = 0;
      halls.length = 0;
      employees.length = 0;
      movies.length = 0;
      runs.length = 0;
      screenings.length = 0;
      seats.length = 0;
      clients.length = 0;
      tickets.length = 0;
      checkTickets.length = 0;
      checks.length = 0;
      moviesGenres.length = 0;

      cinemas.push(...updatedCinemas);
      halls.push(...updatedHalls);
      employees.push(...updatedEmployees);
      movies.push(...updatedMovies);
      runs.push(...updatedRuns);
      screenings.push(...updatedScreenings);
      seats.push(...updatedSeats);
      clients.push(...updatedClients);
      tickets.push(...updatedTickets);
      checkTickets.push(...updatedCheckTickets);
      checks.push(...updatedChecks);
      moviesGenres.push(...updatedMoviesGenres);

      const wrongtickets = tickets.filter((t) => t.TicketsId != t.Number);

      // Вставка даних
      await insertData({
        cinemas,
        halls,
        employees,
        movies,
        runs,
        screenings,
        seats,
        clients,
        tickets,
        checkTickets,
        checks,
        moviesGenres,
        Languages,
        Publishers,
        Countries,
        Genres,
        MovieGenres,
        AgeRestrictions,
        HallTechnologies,
        ScreeningFormats,
        PaymentMethods,
        Cities,
        CinemaNames,
        suppliers,
        deliveryOrders,
        ProductTypes,
        DeliveryOrderStatuses,
        products,
        productsInStorage,
        productsInOrder,
        productPlacements,
        productChecks,
        productCheckDetails,
        EmployeePositions,
        screeningPrices,
        SeatCategories,
      });
      console.log("All operations completed successfully.");
    }

    await runGeneration();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sql.close();
  }
});
