

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

async function readTickets(rowsNumber) {
    return  processCSV('cinema_hall_ticket_sales.csv', 1000);
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


    cinemas = generateCinemas(10, Cities, CinemaNames);
    halls = generateHalls(cinemas);
    employees = generateEmployees(24, cinemas);
    movies = [];

    const ReadMovies = await readMovies(40);

    ReadMovies.forEach((m) => addMovie(m, movies, Languages, Publishers, Countries, Genres, MovieGenres));
    runs = generateRuns(movies);
    screenings = generateScreenings(250, ScreeningFormats, halls, runs, Languages, movies);
    seats = generateSeats(halls, 4, 8, 5, 10);
    clients = generateClients(1400);
    const ticketPrices = [];
    tickets = await readTickets(1000);

    tickets.forEach((t) => addTicket(t));

    function addTicket (ticket) {
        ticketPrices.push({
            ticketPrice: ticket.Ticket_Price,
            isVip: ticket.Seat_Type === 'Standard', 
        })
    }

    tickets = generateTickets(4000, seats, screenings, ticketPrices);

    checkTickets = generateCheckTickets(tickets, screenings, halls);
    checks = generateChecksFromTickets(checkTickets, PaymentMethods, employees, clients, tickets, screenings, halls);


    const suppliers = generateSuppliers(7);

    const deliveryOrdersNumber = 120;

    const products = generateProducts(ProductTypes);
    const productsInOrder = generateProductsInOrder(1000, deliveryOrdersNumber, products);

    const deliveryOrders = generateDeliveryOrders(deliveryOrdersNumber, DeliveryOrderStatuses, PaymentMethods, suppliers, employees, productsInOrder);
    const productPlacements = generateProductPlacements(employees, productsInOrder, deliveryOrders);
    const productsInStorage = generateProductsInStorage(cinemas, productsInOrder, deliveryOrders, employees, productPlacements);

    // regenerateProductsInStorageQuantity(productsInStorage, productPlacements);

    const productChecksNumber = 600;

    const productCheckDetails = generateProductCheckDetails(productChecksNumber, productsInStorage);
    const productChecks = generateProductChecks(productChecksNumber, PaymentMethods, clients, employees, productCheckDetails, productsInStorage, products, productPlacements);

    // regenerateProductsInStorageQuantityAfterCheck(productsInStorage, productCheckDetails);

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

const generateCinemas = (count, cities, CinemaNames) => {
    const cinemas = [];
    let cinemaId = 1;
    const usedCinemaNames = new Set(); // Зберігаємо використані назви

    // Функція для вибору унікальної назви кінотеатру
    const getUniqueCinemaName = () => {
        if (CinemaNames.length === usedCinemaNames.size) {
            throw new Error("Not enough unique cinema names available");
        }
        let name;
        do {
            name = getRandomItem(CinemaNames);
        } while (usedCinemaNames.has(name));
        usedCinemaNames.add(name);
        return name;
    };

    // Step 1: Ensure each city has at least one cinema.
    cities.forEach((city) => {
        cinemas.push({
            CinemasId: cinemaId++,
            Name: getUniqueCinemaName(),
            CitiesId: city.CitiesId,
            Address: faker.location.streetAddress(),
        });
    });

    // Step 2: Distribute remaining cinemas randomly among all cities.
    const remainingCinemasCount = count - cities.length;
    for (let i = 0; i < remainingCinemasCount; i++) {
        const randomCity = getRandomItem(cities); // Випадкове місто
        cinemas.push({
            CinemasId: cinemaId++,
            Name: getUniqueCinemaName(),
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



const generateSeats = (halls, minRows, maxRows, minSeats, maxSeats, vipChance = 0.5, vipRowsCount = 2) => {
    const seats = [];

    halls.forEach((hall) => {
        const rows = getRandomNumberInRange(minRows, maxRows);
        const seatsPerRow = getRandomNumberInRange(minSeats, maxSeats);

        // Чи будуть у цьому залі VIP-ряди (визначаємо випадково)
        const hasVipRows = Math.random() < vipChance;

        let vipRows = new Set();
        if (hasVipRows) {
            const startFromFront = Math.random() < 0.5; // 50% шанс, що VIP-ряди будуть спереду або ззаду
            if (startFromFront) {
                vipRows = new Set([...Array(vipRowsCount).keys()].map(i => i + 1)); // Перші ряди
            } else {
                vipRows = new Set([...Array(vipRowsCount).keys()].map(i => rows - i)); // Останні ряди
            }
        }

        for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                seats.push({
                    SeatsId: seats.length + 1,
                    RowNumber: row,
                    SeatNumber: seat,
                    HallId: hall.HallsId,
                    IsVipCategory: vipRows.has(row), // Перевіряємо, чи ряд VIP
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

const generateTickets = (count, seats, screenings, ticketPrices) => {

    const dollarCoefficient = 15;
    const tickets = [];
    const priceMapping = {}; // Зберігає ціни за комбінацією ScreeningId + IsVipCategory
    const usedSeats = new Map(); // Відстежує зайняті місця для кожного сеансу

    for (let i = 0; i < count; i++) {
        const screening = getRandomItem(screenings);

        // Фільтруємо доступні місця для конкретного залу та сеансу
        const availableSeats = seats.filter(seat =>
            seat.HallId === screening.HallsId &&
            (!usedSeats.has(screening.ScreeningsId) || !usedSeats.get(screening.ScreeningsId).has(seat.SeatsId))
        );

        if (availableSeats.length === 0) continue; // Якщо немає місць, пропускаємо ітерацію

        const seat = getRandomItem(availableSeats);

        // Додаємо місце в список зайнятих
        if (!usedSeats.has(screening.ScreeningsId)) {
            usedSeats.set(screening.ScreeningsId, new Set());
        }
        usedSeats.get(screening.ScreeningsId).add(seat.SeatsId);

        // Унікальний ключ для ціни
        const priceKey = `${screening.ScreeningsId}-${seat.IsVipCategory}`;

        // Якщо ціна ще не визначена для цієї комбінації, беремо випадкову з ticketPrices
        if (!priceMapping[priceKey]) {
            const matchingPrices = ticketPrices.filter(price => price.isVip === seat.IsVipCategory);
            priceMapping[priceKey] = Math.round((matchingPrices.length > 0 
                ? getRandomItem(matchingPrices).ticketPrice // Випадкова ціна з доступних
                : 7 ) * dollarCoefficient) ; // Дефолтна ціна, якщо нічого не знайшли
        }

        tickets.push({
            TicketsId: i + 1,
            SeatId: seat.SeatsId,
            Price: priceMapping[priceKey], // Вставляємо відповідну ціну
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

    // Успішні статуси (95% шансів)
    const successfulStatuses = deliveryOrderStatuses.filter(s => s.DeliveryOrderStatusId === 3); // Delivered

    // Інші статуси (5% шансів)
    const otherStatuses = deliveryOrderStatuses.filter(s => s.DeliveryOrderStatusId !== 3); 

    // Зважений список статусів (95% успішних)
    const weightedStatuses = [
        ...Array(19).fill(successfulStatuses).flat(), // 95% успіху
        ...Array(1).fill(otherStatuses).flat() // 5% інші
    ];

    // Базова дата (2 роки тому)
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - 2);

    // Поточна дата
    const currentDate = new Date();

    // Межа (1 тиждень тому)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    for (let i = 0; i < totalCount; i++) {
        const productsInThisOrder = productsInOrder.filter(p => p.DeliveryOrderId === i + 1);

        // Генеруємо дату так, щоб пізніші замовлення мали пізніші дати
        const orderDate = new Date(baseDate.getTime());
        const timeOffset = (currentDate.getTime() - baseDate.getTime()) * (i / totalCount);
        orderDate.setTime(baseDate.getTime() + timeOffset);

        // Випадковий час у межах доби
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

        // Визначаємо доступні статуси
        let allowedStatuses = weightedStatuses;
        if (orderDate < oneWeekAgo) {
            // Якщо замовлення старше 1 тижня, виключаємо Ordered і Shipped
            allowedStatuses = weightedStatuses.filter(s => ![1, 2].includes(s.DeliveryOrderStatusId));
        }

        const deliveryOrder = {
            DeliveryOrderId: i + 1,
            DeliveryOrderStatusId: getRandomItem(allowedStatuses).DeliveryOrderStatusId,
            PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId,
            SupplierId: getRandomItem(suppliers).SupplierId,
            EmployeeId: getRandomItem(employeesResponsibleForDeliveries),
            Number: i + 1,
            Sum: productsInThisOrder.reduce((acc, p) => acc + (p.Price * p.Quantity), 0),
            OrderDateTime: orderDate.toISOString().slice(0, 19).replace('T', ' ') // Формат "YYYY-MM-DD HH:MM:SS"
        };

        deliveryOrders.push(deliveryOrder);
    }

    return deliveryOrders;
};







const generateProducts = (productTypes) => {
    const BasePrices = {
        1: 80, 2: 45, 3: 55, 4: 50, 5: 60,
        6: 65, 7: 80, 8: 130, 9: 70, 10: 55, 11: 90
    };

    const sizes = ["Small", "Medium", "Large"];
    const SizeCoefficients = { Small: 0.8, Medium: 1, Large: 1.2 };
    const BasePrice = 50;

    const products = [];

    let productId = 1;

    productTypes.forEach(productType => {
        sizes.forEach(size => {
            const basePrice = BasePrices[productType.ProductTypeId] || BasePrice;
            const price = basePrice * SizeCoefficients[size];

            products.push({
                ProductId: productId++,
                ProductTypeId: productType.ProductTypeId,
                Price: price,
                Name: `${productType.ProductType} (${size})`
            });
        });
    });

    return products;
};

const generateProductsInStorage = (cinemas, productsInOrder, deliveryOrders, employees, productPlacements) => {
    const productsInStorage = [];
    const successfulDeliveryStatuses = [3]; // Наприклад, статус "доставлено"

    // Мапа для отримання кінотеатру за EmployeeId
    const employeeCinemaMap = new Map();
    for (const employee of employees) {
        employeeCinemaMap.set(employee.EmployeesId, employee.CinemaId);
    }

    // Мапа для shelfLife кожного продукту
    const productShelfLifeMap = new Map();

    // Мапа для оновлення `ProductPlacement`
    const productPlacementMap = new Map();

    for (const placement of productPlacements) {
        const relatedOrder = productsInOrder.find(p => p.ProductInOrderId === placement.ProductInOrderId);
        if (!relatedOrder) continue;

        const relatedDeliveryOrder = deliveryOrders.find(d => d.DeliveryOrderId === relatedOrder.DeliveryOrderId);
        if (!relatedDeliveryOrder || !successfulDeliveryStatuses.includes(relatedDeliveryOrder.DeliveryOrderStatusId)) continue;

        // 🔥 Отримуємо EmployeeId із ProductPlacement замість DeliveryOrder
        const cinemaId = employeeCinemaMap.get(placement.EmployeeId); 
        if (!cinemaId) continue;

        const orderDate = new Date(relatedDeliveryOrder.OrderDateTime); // Дата замовлення

        // Випадкове коливання виробництва в межах ±5-15 днів від `orderDate`
        const fluctuation = getRandomNumberInRange(-15, -5) * 24 * 60 * 60 * 1000; // у мс
        const productionDate = new Date(orderDate.getTime() + fluctuation);

        // Отримуємо або генеруємо shelfLife
        let shelfLife = productShelfLifeMap.get(relatedOrder.ProductId);
        if (!shelfLife) {
            shelfLife = getRandomNumberInRange(30, 180) * 24 * 60 * 60 * 1000; // 30-180 днів у мс
            productShelfLifeMap.set(relatedOrder.ProductId, shelfLife);
        }

        // Обчислюємо `ExpirationDate`
        const expirationDate = new Date(productionDate.getTime() + shelfLife);

        // Додаємо в продукти на складі
        const productInStorage = {
            ProductInStorageId: productsInStorage.length + 1,
            ProductId: relatedOrder.ProductId,
            CinemaId: cinemaId,
            ProductionDate: productionDate,
            ExpirationDate: expirationDate,
            Quantity: placement.Quantity,
        };

        productsInStorage.push(productInStorage);
        productPlacementMap.set(placement.ProductPlacementId, productInStorage.ProductInStorageId);
    }

    // Оновлюємо `ProductPlacements`, встановлюючи `ProductInStorageId`
    for (const placement of productPlacements) {
        placement.ProductInStorageId = productPlacementMap.get(placement.ProductPlacementId) || null;
    }

    return productsInStorage;
};





const regenerateProductsInStorageQuantity = (productsInStorage, productPlacements) => {
    for (let productInStorage of productsInStorage) {
        const matchingProductPlacements = productPlacements.filter(p => p.ProductInStorageId === productInStorage.ProductInStorageId);
        productInStorage.Quantity = matchingProductPlacements.reduce((acc, p) => {
            return acc + p.Quantity;
        }, 0);
    }
};

const regenerateProductsInStorageQuantityAfterCheck = (productsInStorage, productCheckDetails) => {
    for (let productInStorage of productsInStorage) {
        const matchingCheckDetails = productCheckDetails.filter(p => p.ProductInStorageId === productInStorage.ProductInStorageId);
        productInStorage.Quantity -= matchingCheckDetails.reduce((acc, m) => {
            return acc + m.Quantity;
        }, 0);
    }
};


const generateProductsInOrder = (totalCount, deliveryOrdersNumber, products) => {
    const orders = [];
    const expirationOffsets = new Map(); // Зберігаємо фіксований інтервал для кожного продукту

    const avgProductsPerOrder = Math.floor(totalCount / deliveryOrdersNumber);
    const varyingPoint = Math.round(avgProductsPerOrder / 10);

    for (let i = 0; i < deliveryOrdersNumber; i++) {
        const usedProductIds = new Set();
        const productsInThisOrder = Math.max(1, avgProductsPerOrder + getRandomNumberInRange(varyingPoint, varyingPoint));

        for (let j = 0; j < productsInThisOrder; j++) {
            let product;
            do {
                product = getRandomItem(products);
            } while (usedProductIds.has(product.ProductId));

            usedProductIds.add(product.ProductId);

            const productionDate = getRandomPastDate(2 * 365); // Випадкова дата за останні 2 роки

            // Якщо продукт вже має визначений інтервал, використовуємо його
            let expirationOffset;
            if (expirationOffsets.has(product.ProductId)) {
                expirationOffset = expirationOffsets.get(product.ProductId);
            } else {
                expirationOffset = getRandomNumberInRange(6 * 30, 24 * 30); // 6-24 місяці у днях
                expirationOffsets.set(product.ProductId, expirationOffset);
            }

            const expirationDate = new Date(productionDate);
            expirationDate.setDate(productionDate.getDate() + expirationOffset);

            const order = {
                ProductInOrderId: orders.length + 1, // Унікальний ID
                ProductId: product.ProductId,
                DeliveryOrderId: i + 1,
                Quantity: getRandomNumberInRange(50, 500),
                Price: (product.Price / 2) * (1 + (Math.random() - 0.5) / 10), // Ціна = половина + варіація ±5%
                ProductionDate: productionDate,
                ExpirationDate: expirationDate
            };
            orders.push(order);
        }
    }
    return orders;
};

// Функція для отримання випадкової дати у минулому (у днях)
const getRandomPastDate = (maxDaysAgo) => {
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - getRandomNumberInRange(0, maxDaysAgo));
    return pastDate;
};


const generateProductPlacements = (employees, productsInOrder, deliveryOrders) => {
    const placements = [];
    let placementIdCounter = 1;

    // Успішний статус доставки (Delivered)
    const successfulDeliveryStatus = 3;

    // Фільтруємо успішні замовлення (тільки Delivered)
    const successfulDeliveryOrders = deliveryOrders
        .filter(order => order.DeliveryOrderStatusId === successfulDeliveryStatus)
        .sort((a, b) => a.DeliveryOrderId - b.DeliveryOrderId);

    // Фільтруємо продукти, які були успішно доставлені
    const successfulProductOrders = productsInOrder.filter(productInOrder =>
        successfulDeliveryOrders.some(order => order.DeliveryOrderId === productInOrder.DeliveryOrderId)
    );

    // Допоміжна функція для вибору випадкового елемента
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

    // Допоміжна функція для отримання випадкової кількості днів (1-7)
    const getRandomDaysOffset = () => Math.floor(Math.random() * 7) + 1;

    // Створення записів розміщення продуктів
    for (const productOrder of successfulProductOrders) {
        // Знаходимо відповідне замовлення доставки
        const deliveryOrder = successfulDeliveryOrders.find(order => order.DeliveryOrderId === productOrder.DeliveryOrderId);

        // Отримуємо дату отримання товару (DeliveryDate)
        const receivedDate = new Date(deliveryOrder.OrderDateTime);
        
        // Додаємо випадковий час (1-7 днів)
        const placementDate = new Date(receivedDate);
        placementDate.setDate(receivedDate.getDate() + getRandomDaysOffset());

        // Створюємо запис про розміщення
        const placement = {
            ProductPlacementId: placementIdCounter++,
            EmployeeId: getRandomItem(employees).EmployeesId,
            ProductInOrderId: productOrder.ProductInOrderId,
            Quantity: productOrder.Quantity,
            PlacementDate: placementDate,
        };

        placements.push(placement);
    }

    return placements;
};






const generateProductChecks = (totalCount, paymentMethods, clients, employees, productCheckDetails, productsInStorage, products, productPlacements) => {
    const checks = [];

    // Знайдемо найранішу дату розміщення товару
    let earliestPlacementDate = new Date(Math.min(...productPlacements.map(p => new Date(p.PlacementDate))));

    // Додаємо випадкову затримку (10-60 хв) до першого BuyTime
    let lastBuyTime = new Date(earliestPlacementDate);
    lastBuyTime.setMinutes(lastBuyTime.getMinutes() + Math.floor(Math.random() * 50) + 10); 

    for (let i = 1; i <= totalCount; i++) {
        let sum = 0;
        let latestPlacementDate = new Date(0); // Початкове значення (дуже стара дата)

        const checkDetails = productCheckDetails.filter(d => d.ProductCheckId === i);

        for (const checkDetail of checkDetails) {
            // Знаходимо відповідний продукт у сховищі
            const relevantProductInStorage = productsInStorage.find(product =>
                product.ProductInStorageId === checkDetail.ProductInStorageId
            );

            if (!relevantProductInStorage) continue; // Якщо продукту немає, пропускаємо ітерацію

            // Знаходимо відповідний продукт у списку продуктів
            const relevantProduct = products.find(product =>
                product.ProductId === relevantProductInStorage.ProductId
            );

            if (!relevantProduct) continue; // Якщо продукту немає, пропускаємо ітерацію

            // Додаємо вартість продукту в загальну суму
            sum += checkDetail.Quantity * relevantProduct.Price;

            // Знаходимо дату розміщення продукту
            const placement = productPlacements.find(p => 
                p.ProductInStorageId === relevantProductInStorage.ProductInStorageId
            );

            if (placement && new Date(placement.PlacementDate) > latestPlacementDate) {
                latestPlacementDate = new Date(placement.PlacementDate);
            }
        }

        // Наступний `BuyTime` трохи збільшується
        lastBuyTime = new Date(lastBuyTime);
        lastBuyTime.setMinutes(lastBuyTime.getMinutes() + Math.floor(Math.random() * 60) + 5); // Додаємо випадково від 5 до 65 хвилин

        const check = {
            ProductCheckId: i,
            PaymentMethodId: getRandomItem(paymentMethods).PaymentMethodsId,
            ClientId: getRandomItem(clients).ClientsId,
            EmployeeId: getRandomItem(employees).EmployeesId,
            Number: i,
            Sum: sum, // Використовуємо відфільтровану суму
            BuyTime: new Date(lastBuyTime), // Встановлюємо оновлений BuyTime
        };

        checks.push(check);
    }
    return checks;
};



const generateProductCheckDetails = (productChecksNumber, productsInStorage) => { 
    const checkDetails = [];
    
    for (let j = 1; j <= productChecksNumber; j++) {
        const checkDetailCount = getRandomWeightedNumber({
            1: 10, 2: 50, 3: 20, 4: 10, 5: 5, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1
        });

        const orderedProductIds = new Set();

        // Вибираємо випадковий кінотеатр для цього чеку
        const availableCinemaIds = [...new Set(productsInStorage.map(p => p.CinemaId))];
        const selectedCinemaId = getRandomItem(availableCinemaIds);

        // Динамічно обчислюємо дату порівняння (2023 + трохи більше для вищих ID)
        const baseYear = 2023;
        const expirationThreshold = new Date(baseYear + Math.floor(j / 500), 0, 1); // Додаємо 1 рік за кожні 100 чеків

        // Фільтруємо тільки ті продукти, які є в наявності, не прострочені і з потрібного кінотеатру
        let availableProducts = productsInStorage.filter(p => 
            p.Quantity > 0 && 
            p.CinemaId === selectedCinemaId && 
            new Date(p.ExpirationDate) >= expirationThreshold // Динамічний поріг дати
        );

        for (let i = 0; i < checkDetailCount; i++) {
            if (availableProducts.length === 0) break; // Якщо немає товарів, зупиняємо

            let filteredProducts = availableProducts.filter(p => !orderedProductIds.has(p.ProductInStorageId));

            if (filteredProducts.length === 0) break;

            let productInStorage = getRandomItem(filteredProducts);
            orderedProductIds.add(productInStorage.ProductInStorageId);

            let boughtQuantity;

            do {
                boughtQuantity = getRandomWeightedNumber({
                    1: 40, 2: 50, 3: 20, 4: 10, 5: 5, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1
                });
            } while (productInStorage.Quantity < boughtQuantity);

            productInStorage.Quantity -= boughtQuantity;

            checkDetails.push({
                ProductCheckDetailId: checkDetails.length + 1,
                ProductCheckId: j,
                ProductInStorageId: productInStorage.ProductInStorageId,
                Quantity: boughtQuantity
            });

            // Оновлюємо доступні продукти після зміни кількості
            availableProducts = productsInStorage.filter(p => 
                p.Quantity > 0 && 
                p.CinemaId === selectedCinemaId && 
                new Date(p.ExpirationDate) >= expirationThreshold
            );
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