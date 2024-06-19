// $(document).ready(function () {
//   $("#example").DataTable({
//     //   //disable sorting on last column
//     //   "columnDefs": [
//     //     { "orderable": false, "targets": 5 }
//     //   ],

//     language: {
//       //customize pagination prev and next buttons: use arrows instead of words
//       paginate: {
//         previous: '<span class="fa fa-chevron-left"></span>',
//         next: '<span class="fa fa-chevron-right"></span>',
//       },
//       //customize number of elements to be displayed
//       lengthMenu:
//         'Display <select class="form-control input-sm">' +
//         '<option value="10">10</option>' +
//         '<option value="20">20</option>' +
//         '<option value="30">30</option>' +
//         '<option value="40">40</option>' +
//         '<option value="50">50</option>' +
//         '<option value="-1">All</option>' +
//         "</select> results",
//     },
//   });
// });

$(document).ready(function () {
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

  // Apply custom filtering for date range
  $("#date-from, #date-to").on("change", function () {
    table.draw();
  });

  // Custom filtering function which will search data in column 1 between two dates
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

  // Initialize tooltips (optional)
  $('[data-toggle="tooltip"]').tooltip();

  document.getElementById('researchForm').addEventListener('submit', function(event) {
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
