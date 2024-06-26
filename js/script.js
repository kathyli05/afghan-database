$(document).ready(function () {
  // Initialize Select2
  $('#country-filter').select2();
  $('#type-filter').select2();
  $('#topic-filter').select2();

  // Initialize DataTable
  var table = $("#example").DataTable({
    lengthMenu: [10, 25, 50, 75, 100],
    responsive: true,
    language: {
      paginate: {
        previous: '<span class="fa fa-chevron-left"></span>',
        next: '<span class="fa fa-chevron-right"></span>',
      },
      lengthMenu:
        'Display <select class="form-control input-sm">' +
        '<option value="10">10</option>' +
        '<option value="25">25</option>' +
        '<option value="50">50</option>' +
        '<option value="75">75</option>' +
        '<option value="100">100</option>' +
        '<option value="-1">All</option>' +
        "</select> results",
    },
  });

  // Custom filtering function for date range
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    var minDate = $("#date-from").val();
    var maxDate = $("#date-to").val();
    var date = data[1]; // Date column is the second column (index 1)

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

  // Custom filtering function for multi-select dropdowns
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    var selectedCountries = $('#country-filter').val();
    var selectedTypes = $('#type-filter').val();
    var selectedTopics = $('#topic-filter').val();
    var dataCountry = data[2]; // Country column is the third column (index 2)
    var dataType = data[3]; // Type column is the fourth column (index 3)
    var dataTopic = data[4]; // Topic column is the fifth column (index 4)

    // Check if data matches selected filters
    var matchCountry = selectedCountries.length === 0 || selectedCountries.includes(dataCountry);
    var matchType = selectedTypes.length === 0 || selectedTypes.includes(dataType);
    var matchTopic = selectedTopics.length === 0 || selectedTopics.includes(dataTopic);

    if (matchCountry && matchType && matchTopic) {
      return true;
    }
    return false;
  });

  // Event listener for the Apply Filters button
  $('#apply-filters').on('click', function () {
    table.draw();
  });

  // Initialize tooltips (optional)
  $('[data-toggle="tooltip"]').tooltip();

  document.getElementById('researchForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const abstract = document.getElementById('abstract').value;
    const authors = document.getElementById('authors').value;
    const publicationDate = document.getElementById('publicationDate').value;
    const keywords = document.getElementById('keywords').value;
    const fileUpload = document.getElementById('fileUpload').files[0];
    const otherInfo = document.getElementById('otherInfo').value;
    const contactInfo = document.getElementById('contactInfo').value;

    if (!title || !abstract || !authors || !publicationDate || !keywords || !fileUpload || !contactInfo) {
      alert('Please fill in all required fields.');
      return;
    }

    alert('Research submitted successfully!');

    // Here, you can add code to handle the form submission, e.g., sending data to your server.
  });

});
