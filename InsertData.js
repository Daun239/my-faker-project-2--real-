const { sql, config } = require("./ConnectToDb");

async function insertData({
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
  ProductTypes,
  DeliveryOrderStatuses,
  suppliers,
  deliveryOrders,
  products,
  productsInStorage,
  productsInOrder,
  productPlacements,
  productChecks,
  productCheckDetails,
  EmployeePositions,
  screeningPrices,
  SeatCategories,
}) {
  try {
    await sql.connect(config);

    const generateRandomPassword = () => {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      for (let i = 0; i < 10; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      return password; // ✅ returns a plain string
    };

    const generatePasswords = (employeesCount) => {
      const passwords = [];
      for (let i = 0; i < employeesCount; i++) {
        passwords.push({ password: generateRandomPassword() });
      }
      return passwords;
    };

    const insertEmployeePassword = async (password) => {
      const request = new sql.Request();

      // Optionally hash the password before storing
      request.input("Password", sql.VarChar(255), password);

      const insertQuery = `
        INSERT INTO EmployeePasswords (Password)
        OUTPUT INSERTED.EmployeePasswordId
        VALUES (@Password)
      `;

      const result = await request.query(insertQuery);
      return result.recordset[0].EmployeePasswordId;
    };

    console.log("Began inserting");

    for (const seatCategory of SeatCategories) {
      await insertSeatCategory(seatCategory.SeatCategory);
    }

    for (const employeePosition of EmployeePositions) {
      await insertEmployeePosition(employeePosition.Position);
    }
    for (const publisher of Publishers) {
      await insertPublisher(publisher.publisher);
    }
    for (const country of Countries) {
      await insertCountry(country.country);
    }
    for (const language of Languages) {
      await insertLanguage(language.language);
    }
    for (const ageRestriction of AgeRestrictions) {
      await insertAgeRestriction(ageRestriction.AgeRestriction);
    }
    for (const hallTechnology of HallTechnologies) {
      await insertHallTechnology(hallTechnology.HallTechnology);
    }
    for (const screeningFormat of ScreeningFormats) {
      await insertScreeningFormat(screeningFormat.ScreeningFormat);
    }
    for (const genre of Genres) {
      await insertGenre(genre.genre);
    }
    for (const paymentMethod of PaymentMethods) {
      await insertPaymentMethod(paymentMethod.PaymentMethod);
    }
    for (const city of Cities) {
      await insertCity(city);
    }
    for (const cinema of cinemas) {
      await insertCinema(cinema.Name, cinema.CitiesId, cinema.Address);
    }
    for (const hall of halls) {
      await insertHall(hall.CinemaId, hall.HallNumber, hall.HallTechnologiesId);
    }
    const passwords = generatePasswords(employees.length);

    for (const password of passwords) {
      await insertPassword(password);
    }

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const { password } = passwords[i];

      const employeePasswordId = await insertEmployeePassword(password);

      await insertEmployee(
        employee.CinemaId,
        employee.Name,
        employee.Surname,
        employee.CellNumber,
        employee.Email,
        employee.Position,
        employeePasswordId
      );
    }

    for (const movie of movies) {
      await insertMovie(
        movie.Name,
        movie.CountriesId,
        movie.AgeRestrictionsId,
        movie.PublishersId,
        movie.Runtime,
        movie.Description,
        movie.Budget,
        movie.LanguagesId
      );
    }
    for (const run of runs) {
      await insertRun(run.StartDate, run.EndDate, run.MovieId);
    }
    for (const screening of screenings) {
      await insertScreening(
        screening.ScreeningFormatsId,
        screening.HallsId,
        screening.RunsId,
        screening.LanguagesId,
        screening.StartDate,
        screening.StartTime,
        screening.EndTime
      );
    }

    for (const screeningPrice of screeningPrices) {
      await insertScreeningPrice(
        screeningPrice.TicketPrice,
        screeningPrice.ScreeningId,
        screeningPrice.SeatCategoryId
      );
    }

    for (const seat of seats) {
      await insertSeat(
        seat.RowNumber,
        seat.SeatNumber,
        seat.HallId,
        seat.SeatCategoryId
      );
    }
    for (const client of clients) {
      await insertClient(
        client.Name,
        client.Surname,
        client.CellNumber,
        client.Email
      );
    }
    for (const ticket of tickets) {
      await insertTicket(ticket.SeatId, ticket.ScreeningPriceId, ticket.Number);
    }
    for (const check of checks) {
      await insertCheck(
        check.Sum,
        check.PaymentMethodsId,
        check.EmployeeId,
        check.ClientId,
        check.BuyDateTime
      );
    }
    for (const movieGenre of MovieGenres) {
      await insertMovieGenre(movieGenre.movieId, movieGenre.genresId);
    }
    for (const checkTicket of checkTickets) {
      await insertCheckTicket(checkTicket.CheckId, checkTicket.TicketId);
    }

    for (const ProductType of ProductTypes) {
      await insertProductType(ProductType.ProductType);
    }

    for (const DeliveryOrderStatus of DeliveryOrderStatuses) {
      await insertDeliveryOrderStatus(DeliveryOrderStatus.DeliveryOrderStatus);
    }

    for (const supplier of suppliers) {
      await insertSupplier(
        supplier.Name,
        supplier.Surname,
        supplier.CellNumber,
        supplier.Email
      );
    }

    for (const deliveryOrder of deliveryOrders) {
      await insertDeliveryOrder(
        deliveryOrder.DeliveryOrderStatusId,
        deliveryOrder.PaymentMethodId,
        deliveryOrder.SupplierId,
        deliveryOrder.EmployeeId,
        deliveryOrder.Number,
        deliveryOrder.Sum,
        deliveryOrder.OrderDateTime,
        deliveryOrder.EndDateTime
      );
    }

    for (const product of products) {
      await insertProduct(product.ProductTypeId, product.Price, product.Name);
    }

    for (const productInStorage of productsInStorage) {
      await insertProductInStorage(
        productInStorage.ProductId,
        productInStorage.CinemaId,
        productInStorage.ProductionDate,
        productInStorage.ExpirationDate,
        productInStorage.Quantity
      );
    }

    for (const productInOrder of productsInOrder) {
      await insertProductInOrder(
        productInOrder.ProductId,
        productInOrder.DeliveryOrderId,
        productInOrder.Quantity,
        productInOrder.Price
      );
    }

    // Insert ProductPlacements
    for (const productPlacement of productPlacements) {
      await insertProductPlacement(
        productPlacement.EmployeeId,
        productPlacement.ProductInStorageId,
        productPlacement.ProductInOrderId,
        productPlacement.Quantity,
        productPlacement.PlacementDate
      );
    }

    // Insert ProductChecks
    for (const productCheck of productChecks) {
      await insertProductCheck(
        productCheck.PaymentMethodId,
        productCheck.ClientId,
        productCheck.EmployeeId,
        productCheck.Number,
        productCheck.Sum,
        productCheck.BuyTime
      );
    }

    // Insert ProductCheckDetails
    for (const productCheckDetail of productCheckDetails) {
      await insertProductCheckDetail(
        productCheckDetail.ProductCheckId,
        productCheckDetail.ProductInStorageId,
        productCheckDetail.Quantity
      );
    }

    console.log("All data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    await sql.close();
  }
}

const insertCity = async (city) => {
  try {
    const request = new sql.Request();
    await request.query(`INSERT INTO Cities (City) VALUES ('${city.City}')`);
    // console.log(`City '${city.City}' inserted successfully.`);
  } catch (err) {
    console.error(`Error inserting city '${city.City}':`, err);
  }
};

const insertPublisher = async (name) => {
  try {
    const request = new sql.Request();
    await request.query(
      `INSERT INTO Publishers (Publisher) VALUES ('${name}')`
    );
    // console.log('Publisher inserted successfully');
  } catch (err) {
    console.error("Error inserting publisher:", err);
  }
};

const insertPaymentMethod = async (paymentMethod) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO PaymentMethods (PaymentMethod) 
        VALUES ('${paymentMethod}')
      `);
    // console.log(`Метод оплати '${paymentMethod}' успішно додано.`);
  } catch (err) {
    console.error("Помилка додавання методу оплати:", err);
  }
};

const insertCinema = async (name, cityId, address) => {
  try {
    const pool = await sql.connect(); // Переконайся, що є конфігурація підключення
    const request = pool.request();

    // Додаємо параметри без ризику синтаксичних помилок
    request.input("name", sql.NVarChar, name);
    request.input("cityId", sql.Int, cityId);
    request.input("address", sql.NVarChar, address);

    await request.query(`
        INSERT INTO Cinemas (Name, CityId, Address) 
        VALUES (@name, @cityId, @address)
      `);

    // console.log('Cinema inserted successfully');
  } catch (err) {
    console.error("Error inserting cinema:", err);
  }
};

const insertHall = async (cinemaId, hallNumber, hallTechnologiesId) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO Halls (CinemaId, HallNumber, HallTechnologyId) 
        VALUES (${cinemaId}, ${hallNumber}, ${hallTechnologiesId})
      `);
    // console.log('Hall inserted successfully');
  } catch (err) {
    console.error("Error inserting hall:", err);
  }
};

const insertEmployee = async (
  cinemaId,
  name,
  surname,
  cellNumber,
  email,
  position,
  employeePasswordId
) => {
  try {
    const request = new sql.Request();

    const positionQuery = `
      SELECT EmployeePositionId FROM EmployeePositions WHERE EmployeePosition = @Position
    `;
    request.input("Position", sql.VarChar(50), position);
    const positionResult = await request.query(positionQuery);

    if (positionResult.recordset.length === 0) {
      throw new Error(`Position '${position}' not found in EmployeePositions`);
    }

    const positionId = positionResult.recordset[0].EmployeePositionId;

    request.input("Name", sql.VarChar(50), name);
    request.input("Surname", sql.VarChar(50), surname);
    request.input("CellNumber", sql.VarChar(20), cellNumber);
    request.input("Email", sql.VarChar(100), email);
    request.input("CinemaId", sql.Int, cinemaId);
    request.input("EmployeePositionId", sql.Int, positionId);
    request.input("EmployeePasswordId", sql.Int, employeePasswordId);

    const query = `
      INSERT INTO Employees (
        Name, Surname, CellNumber, Email,
        CinemaId, EmployeePositionId, EmployeePasswordId
      )
      VALUES (
        @Name, @Surname, @CellNumber, @Email,
        @CinemaId, @EmployeePositionId, @EmployeePasswordId
      )
    `;

    await request.query(query);
    console.log("Employee inserted successfully");
  } catch (err) {
    console.error("Error inserting employee:", err);
  }
};

const insertClient = async (name, surname, cellNumber, email) => {
  try {
    const request = new sql.Request();

    // Check if the email already exists
    const checkQuery = `
        SELECT COUNT(*) as count FROM Clients WHERE Email = @Email
      `;
    request.input("Email", sql.VarChar, email);

    const result = await request.query(checkQuery);

    if (result.recordset[0].count > 0) {
      console.log("Client with this email already exists.");
      return; // Stop execution if the email exists
    }

    // Set input parameters for the insert query
    request.input("Name", sql.VarChar, name);
    request.input("Surname", sql.VarChar, surname);
    request.input("CellNumber", sql.VarChar, cellNumber);

    const insertQuery = `
        INSERT INTO Clients (Name, Surname, CellNumber, Email) 
        VALUES (@Name, @Surname, @CellNumber, @Email)
      `;

    await request.query(insertQuery);
    // console.log('Client inserted successfully');
  } catch (err) {
    console.error("Error inserting client:", err);
  }
};

const insertLanguage = async (language) => {
  try {
    const request = new sql.Request();
    request.input("Language", sql.VarChar, language);
    await request.query(`
        INSERT INTO Languages (Language) 
        VALUES (@Language)
      `);
    // console.log('Language inserted successfully:', language);
  } catch (err) {
    console.error("Error inserting language:", err);
  }
};

const insertCountry = async (country) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO Countries (Country) 
        VALUES ('${country}')
      `);
    // console.log('Country inserted successfully');
  } catch (err) {
    console.error("Error inserting country:", err);
  }
};

const insertAgeRestriction = async (ageRestriction) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO AgeRestrictions (AgeRestriction) 
        VALUES (${ageRestriction})
      `);
    // console.log('Age restriction inserted successfully');
  } catch (err) {
    console.error("Error inserting age restriction:", err);
  }
};

const insertGenre = async (genre) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO Genres (Genre) 
        VALUES ('${genre}')
      `);
    // console.log('Genre inserted successfully');
  } catch (err) {
    console.error("Error inserting genre:", err);
  }
};

const insertHallTechnology = async (hallTechnology) => {
  try {
    const request = new sql.Request();

    // Перевіряємо, чи існує запис із таким hallTechnology
    request.input("hallTechnology", sql.VarChar, hallTechnology);
    let checkQuery = `SELECT HallTechnologyId FROM HallTechnologies WHERE HallTechnology = @hallTechnology`;
    let result = await request.query(checkQuery);

    let hallTechnologyId;

    if (result.recordset.length === 0) {
      console.log(`HallTechnology "${hallTechnology}" не існує. Додаємо...`);

      // Вставляємо новий запис
      const insertQuery = `
        INSERT INTO HallTechnologies (HallTechnology)
        OUTPUT INSERTED.HallTechnologyId
        VALUES (@hallTechnology)
      `;

      let insertResult = await request.query(insertQuery);
      hallTechnologyId = insertResult.recordset[0].HallTechnologyId;
      console.log("Hall technology inserted successfully.");
    } else {
      hallTechnologyId = result.recordset[0].HallTechnologyId;
      console.log(`HallTechnology "${hallTechnology}" вже існує.`);
    }

    return hallTechnologyId; // Повертаємо ID для використання при вставці в Halls
  } catch (err) {
    console.error("Error inserting hall technology:", err);
  }
};

const insertSeatCategory = async (seatCategory) => {
  try {
    const request = new sql.Request();
    request.input("SeatCategory", sql.NVarChar(255), seatCategory);

    await request.query(`
      INSERT INTO SeatCategories (SeatCategory) 
      VALUES (@SeatCategory)
    `);
    // console.log('Screening price inserted successfully');
  } catch (err) {
    console.error("Error inserting screening price:", err);
  }
};

const insertPassword = async (passwords) => {
  try {
    const request = new sql.Request();
    request.input("Password", sql.NVarChar(255), passwords);

    await request.query(`
      INSERT INTO EmployeePasswords (Password) 
      VALUES (@Password)
    `);
    // console.log('Screening price inserted successfully');
  } catch (err) {
    console.error("Error inserting screening price:", err);
  }
};

const insertScreeningPrice = async (
  ticketPrice,
  screeningId,
  seatCategoryId
) => {
  try {
    const request = new sql.Request();
    request.input("TicketPrice", sql.Int, ticketPrice);
    request.input("ScreeningId", sql.Int, screeningId);
    request.input("SeatCategoryId", sql.Int, seatCategoryId);

    await request.query(`
      INSERT INTO ScreeningPrices (TicketPrice, SeatCategoryId, ScreeningId) 
      VALUES (@TicketPrice, @SeatCategoryId, @ScreeningId)
    `);
    // console.log('Screening price inserted successfully');
  } catch (err) {
    console.error("Error inserting screening price:", err);
  }
};

const insertScreeningFormat = async (screeningFormat) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO ScreeningFormats (ScreeningFormat) 
        VALUES ('${screeningFormat}')
      `);
    // console.log('Screening format inserted successfully');
  } catch (err) {
    console.error("Error inserting screening format:", err);
  }
};

const insertMovie = async (
  name,
  countriesId,
  ageRestrictionsId,
  publishersId,
  runtime,
  description,
  budget,
  languagesId
) => {
  try {
    const request = new sql.Request();

    // Set input parameters using appropriate SQL types
    request.input("Name", sql.NVarChar(255), name); // Assuming name has a max length of 255
    request.input("CountriesId", sql.Int, countriesId);
    request.input("AgeRestrictionsId", sql.Int, ageRestrictionsId);
    request.input("PublishersId", sql.Int, publishersId);
    request.input("Runtime", sql.Int, runtime);
    request.input("Description", sql.NVarChar(sql.MAX), description); // Use nvarchar(MAX) for large text
    request.input("Budget", sql.Decimal(18, 2), budget);
    request.input("LanguagesId", sql.Int, languagesId);

    const query = `
        INSERT INTO Movies (Name, CountryId, AgeRestrictionId, PublisherId, Runtime, Description, Budget, LanguageId) 
        VALUES (@Name, @CountriesId, @AgeRestrictionsId, @PublishersId, @Runtime, @Description, @Budget, @LanguagesId)
      `;

    await request.query(query);
    // console.log('Movie inserted successfully');
  } catch (err) {
    console.error("Error inserting movie:", err);
  }
};

const insertRun = async (startDate, endDate, movieId) => {
  try {
    const request = new sql.Request();

    // Assuming startDate and endDate are JavaScript Date objects
    const formattedStartDate = startDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Convert to YYYY-MM-DD HH:MM:SS
    const formattedEndDate = endDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Convert to YYYY-MM-DD HH:MM:SS

    // Set input parameters
    request.input("StartDate", sql.DateTime, formattedStartDate);
    request.input("EndDate", sql.DateTime, formattedEndDate);
    request.input("MovieId", sql.Int, movieId);

    const query = `
        INSERT INTO Runs (StartDate, EndDate, MovieId) 
        VALUES (@StartDate, @EndDate, @MovieId)
      `;

    await request.query(query);
    // console.log('Run inserted successfully');
  } catch (err) {
    console.error("Error inserting run:", err);
  }
};

const insertScreening = async (
  screeningFormatsId,
  hallsId,
  runsId,
  languagesId,
  startDate,
  startTime,
  endTime
) => {
  try {
    const request = new sql.Request();

    // Ensure `startDate` is valid
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj)) throw new Error(`Invalid StartDate: ${startDate}`);
    const formattedStartDate = startDateObj.toISOString().split("T")[0];

    // Log values before processing
    // console.log("startTime:", startTime, "endTime:", endTime);

    // Check if startTime and endTime are valid time values
    if (
      typeof startTime !== "string" ||
      !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime)
    ) {
      throw new Error(`Invalid startTime format: ${startTime}`);
    }

    if (
      typeof endTime !== "string" ||
      !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)
    ) {
      throw new Error(`Invalid endTime format: ${endTime}`);
    }

    // Set input parameters
    request.input("ScreeningFormatsId", sql.Int, screeningFormatsId);
    request.input("HallsId", sql.Int, hallsId);
    request.input("RunsId", sql.Int, runsId);
    request.input("LanguagesId", sql.Int, languagesId);
    request.input("StartDate", sql.Date, formattedStartDate);
    request.input("StartTime", sql.Time, startTime);
    request.input("EndTime", sql.Time, endTime);

    const query = `
        INSERT INTO Screenings (ScreeningFormatId, HallId, RunId, LanguageId, StartDate, StartTime, EndTime) 
        VALUES (@ScreeningFormatsId, @HallsId, @RunsId, @LanguagesId, @StartDate, @StartTime, @EndTime)
      `;

    await request.query(query);
  } catch (err) {
    console.error("Error inserting screening:", err);
  }
};

const insertSeat = async (rowNumber, seatNumber, hallId, seatCategoryId) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO Seats (RowNumber, SeatNumber, HallId, SeatCategoryId) 
        VALUES (${rowNumber}, ${seatNumber}, ${hallId}, ${seatCategoryId})
      `);
    // console.log('Seat inserted successfully');
  } catch (err) {
    console.error("Error inserting seat:", err);
  }
};

const insertCheck = async (
  sum,
  paymentMethodsId,
  employeeId,
  clientId,
  buyDateTime
) => {
  try {
    const request = new sql.Request();

    request.input("sum", sql.Int, sum);
    request.input("paymentMethodsId", sql.Int, paymentMethodsId);
    request.input("employeeId", sql.Int, employeeId);
    request.input("clientId", sql.Int, clientId);
    request.input("buyDateTime", sql.DateTime, buyDateTime); // Changed to sql.DateTime

    await request.query(`
        INSERT INTO Checks (Sum, PaymentMethodId, EmployeeId, ClientId, BuyDateTime) 
        VALUES (@sum, @paymentMethodsId, @employeeId, @clientId, @buyDateTime)
      `);

    // console.log('Check inserted successfully');
  } catch (err) {
    console.error("Error inserting check:", err);
  }
};

const insertTicket = async (seatId, screeningPriceId, number) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO Tickets (SeatId, ScreeningPriceId, Number) 
        VALUES (${seatId}, ${screeningPriceId}, ${number})
      `);
    // console.log('Ticket inserted successfully');
  } catch (err) {
    console.error("Error inserting ticket:", err);
  }
};

const insertCheckTicket = async (checkId, ticketId) => {
  try {
    // console.log(`Attempting to insert CheckTicket: CheckId=${checkId}, TicketId=${ticketId}`);

    const request = new sql.Request();
    await request.query(`
        INSERT INTO CheckTickets (CheckId, TicketId) 
        VALUES (${checkId}, ${ticketId})
      `);

    // console.log(`CheckTicket inserted: CheckId=${checkId}, TicketId=${ticketId}`);
  } catch (err) {
    console.error("Error inserting check ticket:", err);
  }
};

const insertMovieGenre = async (moviesId, genresId) => {
  try {
    const request = new sql.Request();
    await request.query(`
        INSERT INTO MoviesGenres (MovieId, GenreId) 
        VALUES (${moviesId}, ${genresId})
      `);
    // console.log('Movie genre inserted successfully');
  } catch (err) {
    console.error("Error inserting movie genre:", err);
  }
};

const insertProductType = async (ProductType) => {
  try {
    const request = new sql.Request();
    request.input("ProductType", sql.VarChar, ProductType); // Use the correct data type
    await request.query(
      "INSERT INTO ProductTypes (ProductType) VALUES (@ProductType)"
    );
  } catch (err) {
    console.log("Error inserting product type", err);
  }
};

const insertDeliveryOrderStatus = async (status) => {
  try {
    const request = new sql.Request();
    request.input("status", sql.VarChar, status); // Use the correct data type
    await request.query(
      "INSERT INTO DeliveryOrderStatuses (DeliveryOrderStatus) VALUES (@status)"
    );
  } catch (err) {
    console.log("Error inserting delivery order status", err);
  }
};

const insertSupplier = async (name, surname, cellNumber, email) => {
  try {
    const request = new sql.Request();

    // Use parameters to avoid unclosed quotation issues
    request.input("Name", sql.VarChar(255), name);
    request.input("Surname", sql.VarChar(255), surname);
    request.input("CellNumber", sql.VarChar(50), cellNumber);
    request.input("Email", sql.VarChar(255), email);

    const query = `
        INSERT INTO Suppliers (Name, Surname, CellNumber, Email)
        VALUES (@Name, @Surname, @CellNumber, @Email)
      `;

    await request.query(query);
    // console.log('Supplier inserted successfully');
  } catch (err) {
    console.error("Error inserting supplier:", err);
  }
};

const insertDeliveryOrder = async (
  deliveryOrderStatusId,
  paymentMethodId,
  supplierId,
  employeeId,
  number,
  sum,
  orderDateTime,
  endDateTime
) => {
  try {
    const request = new sql.Request();

    // Використовуємо параметри для безпечного виконання запиту
    request.input("DeliveryOrderStatusId", sql.Int, deliveryOrderStatusId);
    request.input("PaymentMethodId", sql.Int, paymentMethodId);
    request.input("SupplierId", sql.Int, supplierId);
    request.input("EmployeeId", sql.Int, employeeId);
    request.input("Number", sql.Int, number);
    request.input("Sum", sql.Int, sum);
    request.input("OrderDateTime", sql.DateTime, orderDateTime);
    request.input("EndDateTime", sql.DateTime, endDateTime); // Додаємо параметр EndDateTime

    const query = `
        INSERT INTO DeliveryOrders (DeliveryOrderStatusId, PaymentMethodId, SupplierId, EmployeeId, Number, Sum, OrderDateTime, EndDateTime)
        VALUES (@DeliveryOrderStatusId, @PaymentMethodId, @SupplierId, @EmployeeId, @Number, @Sum, @OrderDateTime, @EndDateTime)
      `;

    await request.query(query);
    // console.log('Delivery order inserted successfully');
  } catch (err) {
    console.error("Error inserting delivery order:", err);
  }
};

const insertProduct = async (productTypeId, price, name) => {
  try {
    const request = new sql.Request();

    // Use parameters to avoid unclosed quotation issues
    request.input("ProductTypeId", sql.Int, productTypeId);
    request.input("Price", sql.Int, price);
    request.input("Name", sql.VarChar(255), name);

    const query = `
        INSERT INTO Products (ProductTypeId, Price, Name)
        VALUES (@ProductTypeId, @Price, @Name)
      `;

    await request.query(query);
    // console.log('Product inserted successfully');
  } catch (err) {
    console.error("Error inserting product:", err);
  }
};

const insertProductInStorage = async (
  productId,
  cinemaId,
  productionDate,
  expirationDate,
  quantity
) => {
  try {
    const request = new sql.Request();

    // Use parameters to avoid unclosed quotation issues
    request.input("ProductId", sql.Int, productId);
    request.input("CinemaId", sql.Int, cinemaId);
    request.input("ProductionDate", sql.DateTime, productionDate);
    request.input("ExpirationDate", sql.DateTime, expirationDate);
    request.input("Quantity", sql.Int, quantity);

    const query = `
        INSERT INTO ProductsInStorage (ProductId, CinemaId, ProductionDate, ExpirationDate, Quantity)
        VALUES (@ProductId, @CinemaId, @ProductionDate, @ExpirationDate, @Quantity)
      `;

    await request.query(query);
    // console.log('Product in storage inserted successfully');
  } catch (err) {
    console.error("Error inserting product in storage:", err);
  }
};

const insertProductInOrder = async (
  productId,
  deliveryOrderId,
  quantity,
  price
) => {
  try {
    const request = new sql.Request();
    request.input("ProductId", sql.Int, productId);
    request.input("DeliveryOrderId", sql.Int, deliveryOrderId);
    request.input("Quantity", sql.Int, quantity);
    request.input("Price", sql.Int, price);

    const query = `
            INSERT INTO ProductsInOrder (ProductId, DeliveryOrderId, Quantity, Price)
            VALUES (@ProductId, @DeliveryOrderId, @Quantity, @Price)
        `;

    await request.query(query);
    // console.log('ProductInOrder inserted successfully');
  } catch (err) {
    console.error("Error inserting ProductInOrder:", err);
  }
};

const insertProductPlacement = async (
  employeeId,
  productInStorageId,
  productInOrderId,
  quantity,
  placementDate
) => {
  try {
    const request = new sql.Request();
    request.input("EmployeeId", sql.Int, employeeId);
    request.input("ProductInStorageId", sql.Int, productInStorageId);
    request.input("ProductInOrderId", sql.Int, productInOrderId);
    request.input("Quantity", sql.Int, quantity);
    request.input("PlacementDate", sql.DateTime, placementDate);

    const query = `
          INSERT INTO ProductPlacements (EmployeeId, ProductInStorageId, ProductInOrderId, Quantity, PlacementDate)
          VALUES (@EmployeeId, @ProductInStorageId, @ProductInOrderId, @Quantity, @PlacementDate)
      `;

    await request.query(query);
    // console.log('ProductPlacement inserted successfully');
  } catch (err) {
    console.error("Error inserting ProductPlacement:", err);
  }
};

const insertProductCheck = async (
  paymentMethodId,
  clientId,
  employeeId,
  number,
  sum,
  buyTime
) => {
  try {
    const request = new sql.Request();
    request.input("PaymentMethodId", sql.Int, paymentMethodId);
    request.input("ClientId", sql.Int, clientId);
    request.input("EmployeeId", sql.Int, employeeId);
    request.input("Number", sql.Int, number);
    request.input("Sum", sql.Int, sum);
    request.input("BuyTime", sql.DateTime, buyTime);

    const query = `
          INSERT INTO ProductChecks (PaymentMethodId, ClientId, EmployeeId, Number, Sum, BuyTime)
          VALUES (@PaymentMethodId, @ClientId, @EmployeeId, @Number, @Sum, @BuyTime)
      `;

    await request.query(query);
    // console.log('ProductCheck inserted successfully');
  } catch (err) {
    console.error("Error inserting ProductCheck:", err);
  }
};

const insertProductCheckDetail = async (
  productCheckId,
  productInStorageId,
  quantity
) => {
  try {
    const request = new sql.Request();
    request.input("ProductCheckId", sql.Int, productCheckId);
    request.input("ProductInStorageId", sql.Int, productInStorageId);
    request.input("Quantity", sql.Int, quantity);

    const query = `
          INSERT INTO ProductCheckDetails (ProductCheckId, ProductInStorageId, Quantity)
          VALUES (@ProductCheckId, @ProductInStorageId, @Quantity)
      `;

    await request.query(query);
    // console.log('ProductCheckDetail inserted successfully');
  } catch (err) {
    console.error("Error inserting ProductCheckDetail:", err);
  }
};

const insertEmployeePosition = async (EmployeePosition) => {
  try {
    const request = new sql.Request();
    request.input("EmployeePosition", sql.VarChar(255), EmployeePosition);

    const query = `
    INSERT INTO EmployeePositions (EmployeePosition)
    VALUES (@EmployeePosition)
`;

    await request.query(query);
    // console.log('ProductCheckDetail inserted successfully');
  } catch (err) {
    console.error("Error inserting EmployeePosition:", err);
  }
};
// Exporting all the functions
module.exports = {
  insertData,
};
