

const { getLastLanguage, getLastPublisher, getLastCountry, getGenresIds, getRandomItem, getRandomNumberInRange, getRandomDateBetween } = require('./GetRandomItem');

const { faker } = require('@faker-js/faker');
const processCSV = require('./random test csv');

const { AgeRestrictions,
    HallTechnologies,
    ScreeningFormats,
    PaymentMethods,
    Cities,
    CinemaNames,
    DeliveryOrderStatuses,
    ProductTypes,
} = require('./Classifiers');

async function readMovies(rowsNumber) {
    return processCSV('TMDB_movie_dataset_v11.csv', rowsNumber);
}

// Функція для отримання ID або додавання нового значення
function getOrCreateId(array, value, key, idKey) {
    let existingItem = array.find(item => item[key] === value);
    if (!existingItem) {
        const newItem = { [idKey]: array.length + 1, [key]: value };
        array.push(newItem);
        return newItem[idKey];
    }
    return existingItem[idKey];
}

function addMoviesGenres(moviesGenres, movieId, genresIds) {
    genresIds.forEach(genreId => {
        moviesGenres.push({ movieId: movieId, genresId: genreId })
    })
}

function addMovie(movie, movies, Languages, Publishers, Countries, Genres, MovieGenres) {
    const LanguageId = getOrCreateId(Languages, getLastLanguage(movie.spoken_languages), 'language', 'LanguageId');
    const PublisherId = getOrCreateId(Publishers, getLastPublisher(movie.production_companies), 'publisher', 'PublisherId');
    const CountryId = getOrCreateId(Countries, getLastCountry(movie.production_countries), 'country', 'CountryId');
    const ageRestrictionId = movie.adult === 'False' ? AgeRestrictions[getRandomInt(0, AgeRestrictions.length - 2)] : AgeRestrictions[AgeRestrictions.length - 1];
    const genreIds = getGenresIds(movie.genres, Genres);

    movies.push({
        MoviesId: movies.length + 1,
        Name: movie.title,
        CountriesId: CountryId,
        AgeRestrictionsId: ageRestrictionId.AgeRestrictionsId,
        PublishersId: PublisherId,
        Runtime: movie.runtime,
        Description: movie.overview,
        Budget: movie.budget,
        LanguagesId: LanguageId
    });

    addMoviesGenres(MovieGenres, movies.length, genreIds);
}


async function generateData(

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
    MovieGenres
) {


    cinemas = generateCinemas(10, Cities);
    halls = generateHalls(cinemas);
    employees = generateEmployees(24, cinemas);
    movies = [];

    const ReadMovies = await readMovies(40);

    ReadMovies.forEach((m) => addMovie(m, movies, Languages, Publishers, Countries, Genres, MovieGenres));
    runs = generateRuns(movies);
    screenings = generateScreenings(250, ScreeningFormats, halls, runs, Languages, movies);
    seats = generateSeats(halls, 4, 8, 5, 10);
    clients = generateClients(1400);
    tickets = generateTickets(4000, seats, screenings);
    checkTickets = generateCheckTickets(tickets, screenings, halls);
    checks = generateChecksFromTickets(checkTickets, PaymentMethods, employees, clients, tickets, screenings, halls);


    const suppliers = generateSuppliers(15);

    const deliveryOrdersNumber = 120;

        const products = generateProducts(150, ProductTypes);
    const productsInOrder = generateProductsInOrder(1000, deliveryOrdersNumber, products);

    const deliveryOrders = generateDeliveryOrders(deliveryOrdersNumber, DeliveryOrderStatuses, PaymentMethods, suppliers, employees, productsInOrder);
    const productsInStorage = generateProductsInStorage(1000, products, cinemas);
    const productPlacements = generateProductPlacements(1000, employees, productsInStorage, productsInOrder, deliveryOrders); // Added deliveryOrders
    const productChecks = generateProductChecks(200, PaymentMethods, clients, employees);
    const productCheckDetails = generateProductCheckDetails(200, productChecks, productsInStorage);


    return {
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


        suppliers,
        deliveryOrders,
        products,
        productsInStorage,
        productsInOrder,
        productPlacements,
        productChecks,
        productCheckDetails
    };
}

const generateCinemas = (count, cities) => {
    const cinemas = [];
    let cinemaId = 1;

    // Step 1: Ensure each city has at least one cinema.
    cities.forEach((city) => {
        cinemas.push({
            CinemasId: cinemaId++,
            Name: faker.company.buzzVerb(),
            CitiesId: city.CitiesId,
            Address: faker.location.streetAddress(),
        });
    });

    // Step 2: Distribute remaining cinemas randomly among all cities.
    const remainingCinemasCount = count - cities.length;
    for (let i = 0; i < remainingCinemasCount; i++) {
        const randomCity = getRandomItem(cities); // Pick a random city.
        cinemas.push({
            CinemasId: cinemaId++,
            Name: faker.company.buzzVerb(),
            CitiesId: randomCity.CitiesId,
            Address: faker.location.streetAddress(),
        });
    }

    return cinemas;
};

const generateHalls = (cinemas) => {

    // console.log('CINEMAS = ', cinemas);
    const halls = [];

    // Генеруємо зали для кожного кінотеатру
    cinemas.forEach((cinema) => {
        const hallCount = getRandomInt(2, 5); // Випадкова кількість залів від 2 до 5

        for (let i = 0; i < hallCount; i++) {
            const hallTechnology = getRandomItem(HallTechnologies).HallTechnologiesId;

            // console.log('HallTechnologiesId = ', hallTechnology);
            halls.push({
                HallsId: halls.length + 1, // Унікальний ідентифікатор для кожного залу
                CinemaId: cinema.CinemasId,
                HallNumber: i + 1, // Номер залу для даного кінотеатру (від 1 до hallCount)
                HallTechnologiesId: hallTechnology,
            });
        }
    });

    return halls;
};

const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;


const generateEmployees = (totalCount, cinemas) => {
    // console.log('GENERATING EMPLOYEES');
    const employees = [];
    const minEmployeesPerCinema = 3; // Minimum employees per cinema

    // Create a map to track employee count per cinema
    const cinemaEmployeeMap = new Map();

    // First, assign at least 3 employees to each cinema
    cinemas.forEach(cinema => {
        const cinemaId = cinema.CinemasId;
        cinemaEmployeeMap.set(cinemaId, []);

        for (let j = 0; j < minEmployeesPerCinema; j++) {
            const employee = {
                EmployeesId: employees.length + 1, // Unique ID for each employee
                CinemaId: cinemaId,
                Name: faker.person.firstName(),
                Surname: faker.person.lastName(),
                CellNumber: faker.phone.number(),
                Email: faker.internet.email(),
            };
            employees.push(employee);
            cinemaEmployeeMap.get(cinemaId).push(employee); // Track the employees assigned to this cinema
        }
    });

    // Now generate additional employees if the total count exceeds the minimum required
    const remainingEmployeesCount = totalCount - (cinemas.length * minEmployeesPerCinema);
    if (remainingEmployeesCount > 0) {
        for (let i = 0; i < remainingEmployeesCount; i++) {
            const cinemaId = getRandomItem(cinemas).CinemasId;
            const employee = {
                EmployeesId: employees.length + 1, // Unique ID for each employee
                CinemaId: cinemaId,
                Name: faker.person.firstName(),
                Surname: faker.person.lastName(),
                CellNumber: faker.phone.number(),
                Email: faker.internet.email(),
            };
            employees.push(employee);
            cinemaEmployeeMap.get(cinemaId).push(employee); // Track the employees assigned to this cinema
        }
    }

    return employees;
};

// Функція для генерації даних для Клієнтів
const generateClients = (count) => {
    const clients = [];
    for (let i = 0; i < count; i++) {
        clients.push({
            ClientsId: i + 1,
            Name: faker.person.firstName(),
            Surname: faker.person.lastName(),
            CellNumber: faker.phone.number(),
            Email: faker.internet.email(),
        });
    }
    return clients;
};

const generateMovies = (count, countries, ageRestrictions, publishers, languages) => {
    const movies = [];
    for (let i = 0; i < count; i++) {
        // Generate a more complex and fitting name
        const genre = getRandomItem(Genres).Genre; // Random genre
        const character = faker.name.firstName(); // Random character name
        const setting = faker.address.city(); // Random setting (city)

        const name = `${character} in the ${genre} of ${setting} - ${faker.company.buzzVerb()}`;
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize the first letter of Name

        // Generate a more thematic description
        const plotTwist = faker.hacker.phrase(); // Random plot twist
        const theme = faker.lorem.sentence(); // Random theme sentence
        const description = `In this ${genre} film, ${character} navigates through a world of intrigue and suspense, where ${plotTwist}. The story explores themes of ${theme}`;
        const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1); // Capitalize the first letter of Description

        movies.push({
            MoviesId: i + 1,
            Name: capitalizedName, // Use the capitalized name
            CountriesId: getRandomItem(countries).CountriesId,
            AgeRestrictionsId: getRandomItem(ageRestrictions).AgeRestrictionsId,
            PublishersId: getRandomItem(publishers).PublishersId,
            Runtime: getRandomNumberInRange(60, 180), // Between 60 to 180 minutes
            Description: capitalizedDescription, // Use the capitalized description
            Budget: getRandomNumberInRange(100000, 10000000), // Between 100k and 10 million
            LanguagesId: getRandomItem(languages).LanguagesId,
        });
    }
    return movies;
};




const generateRuns = (movies) => {
    const runs = [];

    for (let i = 0; i < movies.length; i++) {
        runs.push({
            RunsId: i + 1,
            StartDate: new Date(Date.now() - getRandomNumberInRange(0, 365) * 24 * 60 * 60 * 1000), // Random past date
            EndDate: new Date(Date.now() + getRandomNumberInRange(1, 30) * 24 * 60 * 60 * 1000),  // Random future date
            MovieId: movies[i].MoviesId, // Directly copy the movie ID
        });
    }
    return runs;
};




const generateScreenings = (count, screeningFormats, halls, runs, languages, movies) => {
    const screenings = [];

    for (let i = 0; i < count; i++) {
        const selectedRun = getRandomItem(runs); // Get a random run
        const selectedMovie = movies.find(movie => movie.MoviesId === selectedRun.MovieId); // Find the corresponding movie
        const runtime = selectedMovie.Runtime; // Get the runtime of the selected movie in minutes

        let startDate;
        let startTime;

        do {
            // Generate a random start date within the run period
            startDate = getRandomDateBetween(selectedRun.StartDate, selectedRun.EndDate);

            // Extract only the time part for StartTime
            const randomHour = getRandomInt(0, 23);
            const randomMinute = getRandomInt(0, 59);
            startTime = new Date(startDate);
            startTime.setHours(randomHour, randomMinute, 0, 0);

        } while (startTime.getTime() + runtime * 60000 > selectedRun.EndDate.getTime()); // Ensure it fits within the run period

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + runtime); // Calculate end time

        screenings.push({
            ScreeningsId: i + 1,
            ScreeningFormatsId: getRandomItem(screeningFormats).ScreeningFormatsId,
            HallsId: getRandomItem(halls).HallsId,
            RunsId: selectedRun.RunsId,
            LanguagesId: getRandomItem(languages).LanguageId,
            StartDate: startDate,
            StartTime: formatTime(startTime), // Store as TIME
            EndTime: formatTime(endTime),     // Store as TIME
        });
    }

    return screenings;
};



const formatTime = (date) =>
    date.toTimeString().split(' ')[0];



const generateSeats = (halls, minRows, maxRows, minSeats, maxSeats) => {
    const seats = [];

    halls.forEach((hall) => {
        const rows = getRandomNumberInRange(minRows, maxRows);
        const seatsPerRow = getRandomNumberInRange(minSeats, maxSeats);

        for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                seats.push({
                    SeatsId: seats.length + 1,
                    RowNumber: row,
                    SeatNumber: seat,
                    HallId: hall.HallsId,
                    IsVipCategory: Math.random() < 0.5, // Random boolean value
                });
            }
        }
    });

    return seats;
};



const generateChecks = (count, paymentMethods, employees, clients, tickets) => {
    const checks = [];
    const ticketMap = new Map(); // Create Map for tracking tickets for each check

    // Generate checks
    for (let i = 0; i < count; i++) {
        const buyDateTime = faker.date.recent(); // Generate a recent date-time for both BuyDate and BuyTime

        checks.push({
            ChecksId: i + 1,
            PaymentMethodsId: getRandomItem(paymentMethods).PaymentMethodsId,
            EmployeeId: getRandomItem(employees).EmployeesId,
            ClientId: getRandomItem(clients).ClientsId,
            BuyDateTime: buyDateTime, // Use combined BuyDateTime
            Sum: 0 // Initialize sum to 0
        });

        ticketMap.set(checks[i].ChecksId, []); // Initialize an array for tickets for each check
    }

    // Indices for assigning tickets
    let ticketIndex = 0; // Index for tracking tickets

    // Randomly assign tickets to checks
    for (const check of checks) {
        const numTicketsForCheck = Math.min(2 + Math.floor(Math.random() * 3), tickets.length - ticketIndex); // Random number of tickets (2-4)

        // Assign tickets, ensuring we don’t exceed available tickets
        for (let j = 0; j < numTicketsForCheck && ticketIndex < tickets.length; j++) {
            ticketMap.get(check.ChecksId).push(tickets[ticketIndex]); // Add ticket to the corresponding check
            ticketIndex++; // Move to the next ticket
        }
    }

    // Calculate the total sum for each check
    checks.forEach(check => {
        const connectedTickets = ticketMap.get(check.ChecksId);
        if (connectedTickets.length > 0) {
            check.Sum = connectedTickets.reduce((sum, ticket) => sum + ticket.Price, 0);
        }
    });

    return checks;
};



// Helper to get CinemaId from a ticket
const getCinemaIdFromTicket = (ticket, screenings, halls) => {
    const screening = screenings.find(s => s.ScreeningsId === ticket.ScreeningsId);
    const hall = halls.find(h => h.HallsId === screening.HallsId);
    return hall.CinemaId;
};

// Function to generate Checks based on CheckTickets
const generateChecksFromTickets = (checkTickets, paymentMethods, employees, clients, tickets, screenings, halls) => {
    const checks = [];
    const ticketMap = new Map();

    // Group CheckTickets by CheckId
    checkTickets.forEach(({ CheckId, TicketId }) => {
        if (!ticketMap.has(CheckId)) {
            ticketMap.set(CheckId, []);
        }
        ticketMap.get(CheckId).push(TicketId);
    });

    // Generate Checks with increasing BuyDate and BuyTime
    let baseDate = new Date(); // Starting point for the dates

    ticketMap.forEach((ticketIds, checkId) => {
        const firstTicket = tickets.find(t => t.TicketsId === ticketIds[0]);
        const cinemaId = getCinemaIdFromTicket(firstTicket, screenings, halls);

        // Filter employees who belong to the correct cinema
        const availableEmployees = employees.filter(e => e.CinemaId === cinemaId);

        // console.log('First ticket = ', firstTicket, ' cinemaId = ', cinemaId, " availableEmployees = ", availableEmployees);
        const randomEmployee = getRandomItem(availableEmployees);
        const randomEmployeeId = randomEmployee.EmployeesId;

        const randomPaymentMethodId = getRandomItem(paymentMethods).PaymentMethodsId;
        const randomClient = getRandomItem(clients);
        const randomClientId = randomClient.ClientsId;

        // Increment date and time for each new check
        const buyDate = new Date(baseDate);
        buyDate.setMinutes(buyDate.getMinutes() + checkId * 10); // Slight time increment


        // console.log('Cinema id = ', cinemaId, 'Random Employee = ' , randomEmployee );
        // Create a check entry
        const check = {
            ChecksId: checkId, // Use the same CheckId as CheckTicket
            PaymentMethodsId: randomPaymentMethodId,
            EmployeeId: randomEmployeeId,
            ClientId: randomClientId,
            BuyDate: buyDate,
            BuyTime: buyDate,
            Sum: 0, // Will calculate later
        };

        // Calculate the total sum for the check
        check.Sum = ticketIds.reduce((sum, ticketId) => {
            const ticket = tickets.find(t => t.TicketsId === ticketId);
            return sum + (ticket ? ticket.Price : 0);
        }, 0);

        checks.push(check);
    });

    return checks;
};

// Function to generate CheckTickets until all tickets are linked
const generateCheckTickets = (tickets, screenings, halls) => {
    const checkTickets = [];
    let currentCheckId = 1;
    let previousCinemaId = null;

    // Iterate over all tickets and group them into checks
    tickets.forEach((ticket, index) => {
        const cinemaId = getCinemaIdFromTicket(ticket, screenings, halls);

        // If cinema changes or it's the first ticket, create a new check
        if (previousCinemaId !== null && cinemaId !== previousCinemaId) {
            currentCheckId++; // Start a new check
        }

        // Add the current ticket to the current check
        checkTickets.push({
            CheckTicketsId: checkTickets.length + 1, // Unique identifier
            CheckId: currentCheckId,
            TicketId: ticket.TicketsId,
        });

        // Update the previous cinema ID for the next iteration
        previousCinemaId = cinemaId;
    });

    return checkTickets;
};

const generateTickets = (count, seats, screenings) => {
    const tickets = [];
    const priceMapping = {}; // Stores price by ScreeningId + IsVipCategory combination
    const usedSeats = new Map(); // Map to track used seats per screening

    for (let i = 0; i < count; i++) {
        const screening = getRandomItem(screenings);

        // Фільтруємо місця, які належать до залу цього сеансу і ще не були використані
        const availableSeats = seats.filter(seat =>
            seat.HallId === screening.HallsId &&
            (!usedSeats.has(screening.ScreeningsId) || !usedSeats.get(screening.ScreeningsId).has(seat.SeatsId))
        );

        if (availableSeats.length === 0) continue; // Якщо немає доступних місць, пропускаємо ітерацію

        const seat = getRandomItem(availableSeats);

        // Додаємо місце до використаних для цього сеансу
        if (!usedSeats.has(screening.ScreeningsId)) {
            usedSeats.set(screening.ScreeningsId, new Set());
        }
        usedSeats.get(screening.ScreeningsId).add(seat.SeatsId);

        // Create a unique key for the screening and seat category
        const priceKey = `${screening.ScreeningsId}-${seat.IsVipCategory}`;

        // If the price for this combination is not set, generate and store it
        if (!priceMapping[priceKey]) {
            priceMapping[priceKey] = getRandomNumberInRange(100, 500); // Random price between 100 and 500
        }

        tickets.push({
            TicketsId: i + 1,
            SeatId: seat.SeatsId,
            Price: priceMapping[priceKey], // Consistent price for the same screening + seat type
            Number: i + 1,
            ScreeningsId: screening.ScreeningsId,
        });
    }

    return tickets;
};


// Функція для генерації даних для Жанрів Фільмів
const generateMoviesGenres = (count, movies, genres) => {
    const moviesGenres = [];
    let id = 1;

    // Step 1: Assign at least one genre to each movie
    movies.forEach((movie) => {
        const genre = getRandomItem(genres); // Assign a random genre
        moviesGenres.push({
            MoviesGenresId: id++,
            MoviesId: movie.MoviesId,
            GenresId: genre.GenresId,
        });
    });

    // Step 2: Assign remaining genres randomly
    const extraAssociations = count - movies.length;
    for (let i = 0; i < extraAssociations; i++) {
        moviesGenres.push({
            MoviesGenresId: id++,
            MoviesId: getRandomItem(movies).MoviesId,
            GenresId: getRandomItem(genres).GenresId,
        });
    }

    return moviesGenres;
};


const generateSuppliers = (totalCount) => {
    const suppliers = [];

    for (let i = 0; i < totalCount; i++) {
        const supplier = {
            SupplierId: i + 1, // Adding unique ID
            Name: faker.person.firstName(),
            Surname: faker.person.lastName(),
            CellNumber: faker.phone.number(),
            Email: faker.internet.email(),
        };

        suppliers.push(supplier);
    }

    return suppliers;
};

const generateDeliveryOrders = (totalCount, deliveryOrderStatuses, paymentMethods, suppliers, employees, productsInOrder) => {
    const deliveryOrders = [];

    const employeeNum = 3;
    const employeesResponsibleForDeliveries = [];
    for (let i = 0; i < employeeNum; i++) {
        let employeeId;
        do {
            employeeId = getRandomItem(employees).EmployeesId;
        } while (employeesResponsibleForDeliveries.includes(employeeId));

        employeesResponsibleForDeliveries.push(employeeId);
    }

    for (let i = 0; i < totalCount; i++) {
        const productsInThisOrder = productsInOrder.filter(p => p.DeliveryOrderId === i + 1);

        const deliveryOrder = {
            DeliveryOrderId: i + 1, // Adding unique ID
            DeliveryOrderStatusId: getRandomItem(deliveryOrderStatuses).DeliveryOrderStatusId,
            PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId, // Fixed key
            SupplierId: getRandomItem(suppliers).SupplierId,
            EmployeeId: getRandomItem(employeesResponsibleForDeliveries), // Select only from responsible employees
            Number: i + 1,
            Sum: productsInThisOrder.reduce((acc, p) => acc + (p.Price * p.Quantity), 0) // Fixed reduce
        };

        deliveryOrders.push(deliveryOrder);
    }

    return deliveryOrders;
};


const generateProducts = (totalCount, productTypes) => {
    const BasePrices = {
        1: 80, 2: 45, 3: 55, 4: 50, 5: 60,
        6: 65, 7: 80, 8: 130, 9: 70, 10: 55, 11: 90
    };

    const sizes = ["Small", "Medium", "Large"];
    const SizeCoefficients = { Small: 0.8, Medium: 1, Large: 1.2 };
    const products = [];
    const BasePrice = 50;

    for (let i = 0; i < totalCount; i++) {
        const productType = getRandomItem(productTypes);
        const size = getRandomItem(sizes);
        const basePrice = BasePrices[productType.ProductTypeId] || BasePrice;
        const price = basePrice * SizeCoefficients[size];

        const product = {
            ProductId: i + 1, // Adding unique ID
            ProductTypeId: productType.ProductTypeId,
            Price: price,
            Name: `${productType.ProductType} (${size})`
        };

        products.push(product);
    }

    return products;
};

const generateProductsInStorage = (totalCount, products, cinemas) => {
    const productsInStorage = [];

    for (let i = 0; i < totalCount; i++) {
        const productInStorage = {
            ProductInStorageId: i + 1, // Adding unique ID
            ProductId: getRandomItem(products).ProductId,
            CinemaId: getRandomItem(cinemas).CinemasId,
            ProductionDate: faker.date.past(1),
            ExpirationDate: faker.date.future(1),
            Quantity: getRandomNumberInRange(0, 100)
        };

        productsInStorage.push(productInStorage);
    }

    return productsInStorage;
};

const generateProductsInOrder = (totalCount, deliveryOrdersNumber, products) => {
    const orders = [];

    const productsPerOrder = Math.floor(totalCount / deliveryOrdersNumber); // Кількість продуктів на одне замовлення

    for (let i = 0; i < deliveryOrdersNumber; i++) {
        const usedProductIds = new Set(); // Щоб уникати повторень у межах одного замовлення

        for (let j = 0; j < productsPerOrder; j++) {
            let product = getRandomItem(products);

            // Перевіряємо, чи цей товар вже використано в цьому замовленні
            while (usedProductIds.has(product.ProductId)) {
                product = getRandomItem(products);
            }
            usedProductIds.add(product.ProductId);

            const order = {
                ProductInOrderId: orders.length + 1, // Унікальний ID
                ProductId: product.ProductId,
                DeliveryOrderId: i + 1, // Генеруємо ID замовлення (i+1)
                Quantity: getRandomNumberInRange(50, 100),
                Price: product.Price // Беремо ціну товару
            };
            orders.push(order);
        }
    }
    return orders;
};



const generateProductPlacements = (employees, productsInStorage, productsInOrder, deliveryOrders) => {
    const placements = [];

    // Фільтруємо успішно доставлені замовлення
    const successfulDeliveryStatuses = [4, 5, 6]; // Delivered, Received, Stocked
    const successfulDeliveryOrders = deliveryOrders
        .filter(order => successfulDeliveryStatuses.includes(order.DeliveryOrderStatusId))
        .sort((a, b) => a.DeliveryOrderId - b.DeliveryOrderId); // Сортуємо за ID для коректного розподілу дат

    // Фільтруємо продукти, які належать успішним замовленням
    const successfulProductOrders = productsInOrder.filter(productInOrder =>
        successfulDeliveryOrders.some(order => order.DeliveryOrderId === productInOrder.DeliveryOrderId)
    );

    // Відстежуємо, чи створено розміщення для конкретного замовлення
    const deliveryOrderHasPlacement = new Set();

    for (const productInStorage of productsInStorage) {
        const matchingProductOrder = successfulProductOrders.find(p => p.ProductId === productInStorage.ProductId);
        if (!matchingProductOrder) continue; // Пропускаємо, якщо немає відповідного продукту в замовленні

        // Перевіряємо, чи ще немає розміщення для цього замовлення
        if (deliveryOrderHasPlacement.has(matchingProductOrder.DeliveryOrderId)) continue;

        // Випадково вирішуємо, чи створювати розміщення (50% шанс)
        if (Math.random() < 0.5) continue;

        deliveryOrderHasPlacement.add(matchingProductOrder.DeliveryOrderId);

        const placement = {
            ProductPlacementId: placements.length + 1, // Унікальний ID
            EmployeeId: getRandomItem(employees).EmployeesId,
            ProductInStorageId: productInStorage.ProductInStorageId,
            ProductInOrderId: matchingProductOrder.ProductInOrderId,
            Quantity: productInStorage.Quantity, // Кількість повністю відповідає складу
            PlacementDate: faker.date.recent(successfulDeliveryOrders.indexOf(
                successfulDeliveryOrders.find(order => order.DeliveryOrderId === matchingProductOrder.DeliveryOrderId)
            ) * 2), // Дата залежить від ID замовлення
        };

        placements.push(placement);
    }

    return placements;
};


const generateProductChecks = (totalCount, paymentMethods, clients, employees, productCheckDetails) => {
    const checks = [];

    for (let i = 1; i <= totalCount; i++) {

        productCheckDetails.filter(d => d.productCheckDetailId === i);

        const check = {
            ProductCheckId: i,
            PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId,
            ClientId: getRandomItem(clients).ClientsId,
            EmployeeId: getRandomItem(employees).EmployeesId,
            Number: i,
            Sum: productCheckDetails.reduce((acc, p => {
                return acc + p;
            }), 0),
            BuyTime: faker.date.past(),
        };
        checks.push(check);
    }
    return checks;
};

const generateProductCheckDetails = (totalCount, productChecks, productsInStorage) => {
    const checkDetails = [];

    for (let check of productChecks) {
        const checkDetailCount = getRandomWeightedNumber({ 1: 10, 2: 50, 3: 20, 4: 10, 5: 5, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1 }); // 2 - найбільш імовірне значення

        for (let i = 0; i < checkDetailCount; i++) {
            checkDetails.push({
                ProductCheckDetailId: checkDetails.length + 1, // Унікальний ID
                ProductCheckId: check.ProductCheckId, 
                ProductInStorageId: getRandomItem(productsInStorage).ProductInStorageId,
                Quantity: getRandomWeightedNumber({ 1: 10, 2: 50, 3: 20, 4: 10, 5: 5, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1 }),
            });
        }
    }
    return checkDetails;
};

// Функція для генерації числа з ймовірностями
const getRandomWeightedNumber = (weights) => {
    const entries = Object.entries(weights);
    const weightedArray = entries.flatMap(([num, weight]) => Array(weight).fill(parseInt(num)));
    return getRandomItem(weightedArray);
};


module.exports = { generateData };