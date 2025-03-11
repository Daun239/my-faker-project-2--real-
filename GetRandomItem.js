  // Функції для отримання останніх значень
  function getLastLanguage(languages) {
    return languages.split(',').map(lang => lang.trim()).pop();
  }
  
  function getLastPublisher(publishers) {
    return publishers.split(',').map(pub => pub.trim()).pop();
  }
  
  function getLastCountry(countries) {
    return countries.split(',').map(c => c.trim()).pop();
  }
  
  function getGenresIds(genresToParse, Genres) {
    return genresToParse.split(',').map(genre => getOrCreateId(Genres, genre.trim(), 'genre', 'GenresId'));
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
  
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  const getRandomNumberInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Generate a random date between two given dates
  const getRandomDateBetween = (startDate, endDate) => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const randomTime = Math.floor(Math.random() * (endTime - startTime + 1)) + startTime;
    return new Date(randomTime);
  };


module.exports = { getLastLanguage, getLastPublisher, getLastCountry, getGenresIds, getRandomItem, getRandomNumberInRange, getRandomDateBetween }