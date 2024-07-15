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
      search: "Search by keyword:", // Change the placeholder text
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
    var date = data[3]; // Date column is now the fourth column (index 3)

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
    var dataCountry = data[5].split(', '); // Country column is now the sixth column (index 5)
    var dataType = data[4].split(', '); // Type column is now the fifth column (index 4)
    var dataTopic = data[1].split(', '); // Topic column is now the second column (index 1)

    // Check if data matches selected filters
    var matchCountry = selectedCountries.length === 0 || selectedCountries.some(tag => dataCountry.includes(tag));
    var matchType = selectedTypes.length === 0 || selectedTypes.some(tag => dataType.includes(tag));
    var matchTopic = selectedTopics.length === 0 || selectedTopics.some(tag => dataTopic.includes(tag));

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
});
