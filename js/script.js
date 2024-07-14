$(document).ready(function () {
  // Initialize DataTables
  const table = $("#example").DataTable();

  // Fetch data from the server
  console.log('Starting fetch request'); 
  fetch('http://localhost:3000/data')
    .then(response => {
      console.log('Received response:', response);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Populate the table with data
      console.log('Data fetched:', data); 
      const tbody = $('#example tbody');
      tbody.empty(); // Clear any existing rows
      data.forEach(item => {
        const row = `
          <tr>
            <td><a href="${item.link}">${item.source_name}</a></td>
            <td>${item.date_of_pub}</td>
            <td>${item.country_of_publication}</td>
            <td>${item.type_of_pub}</td>
            <td>${item.topics}</td>
            <td>${item.summary}</td>
          </tr>
        `;
        tbody.append(row);
      });
      // Reinitialize DataTables
      table.draw();
    })
    .catch(error => console.error('Error fetching data:', error));

  // Apply custom filtering for date range
  $("#date-from, #date-to").on("change", function () {
    table.draw();
  });

  // Apply custom filtering for country, type, and topic
  $("#country-filter, #type-filter, #topic-filter").on("keyup", function () {
    table.draw();
  });

  // Custom filtering function for date range
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    const minDate = $("#date-from").val();
    const maxDate = $("#date-to").val();
    const date = data[4];
    if (
      (minDate === "" && maxDate === "") ||
      (minDate === "" && date <= maxDate) ||
      (minDate <= date && maxDate === "") ||
      (minDate <= date && date <= maxDate)
    ) {
      return true;
    }
    return false;
  });

  // Custom filtering function for country, type, and topic
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    const country = $("#country-filter").val().toLowerCase();
    const type = $("#type-filter").val().toLowerCase();
    const topic = $("#topic-filter").val().toLowerCase();
    const countryData = data[0].toLowerCase(); 
    const typeData = data[6].toLowerCase(); 
    const topicData = data[3].toLowerCase(); 
    if (
      (country === "" || countryData.includes(country)) &&
      (type === "" || typeData.includes(type)) &&
      (topic === "" || topicData.includes(topic))
    ) {
      return true;
    }
    return false;
  });
});
