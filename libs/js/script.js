class DatabaseQuery {
  constructor(querytype) {
    this.querytype = querytype;
  }

  createData = async (firstName, lastName, email, departmentID, table) => {
    console.log(firstName, lastName, email, departmentID, table);
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'create',
          querytype: this.querytype,
          firstName: firstName,
          lastName: lastName,
          email: email,
          departmentID: departmentID,
          table: table
        },
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  readData = async (search, param = 0) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'read',
          querytype: this.querytype,
          search: search,
          param: param
        },
        success: function (result) {
          resolve(result.data);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  updateData = async (id, email, department) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'update',
          querytype: this.querytype,
          id: id,
          email: email,
          department: department
        },
        success: function (result) {
          resolve(result.data);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  deleteData = async (
    deleteType,
    id = '0',
    department = '0',
    location = '0'
  ) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        url: 'libs/php/databaseFunctions.php',
        dataType: 'json',
        data: {
          operation: 'delete',
          querytype: this.querytype,
          data: deleteType,
          id: id,
          department: department,
          location: location
        },
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };
}

let visibleSearch = false;
let marginTop = ['162px', '198px'];

const scrollReset = () => {
  if ($('#main-content').length) {
    document.getElementById('main-content').scrollIntoView();
  }
  if ($('#page-content').length) {
    document.getElementById('page-content').scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }
};

const errorDisplay = (error, color = 'red') => {
  $('#main-content-header').append(
    `<span id="error" style="color: ${color}">${error.responseText}</span>`
  );
  $(document).on('click', function () {
    $('#error').remove();
  });
};

const shortenDepartmentString = (departmentName, max) => {
  let departmentTextString = departmentName;
  let maxLength = max;
  if (departmentTextString.length > maxLength) {
    departmentTextString = departmentTextString.substr(0, maxLength) + '...';
  }
  return departmentTextString;
};

const personnelDirectoryQuery = new DatabaseQuery('personnel');
const departmentDirectoryQuery = new DatabaseQuery('department');
const locationDirectoryQuery = new DatabaseQuery('location');
const idQuery = new DatabaseQuery('id');
const personnelUpdate = new DatabaseQuery('update');
const deletePersonnel = new DatabaseQuery('delete');
const createNewStaffRecord = new DatabaseQuery('create');

personnelDirectoryQuery.readData('all_personnel').then((response) => {
  console.log(response);
});

const updateProfileDepartmentList = async (location = 'all', department) => {
  departmentDirectoryQuery
    .readData(location, 'location')
    .then((response) => {
      response.forEach((dept) => {
        if (dept.name !== department) {
          $('#department-selector').append(
            `<option value="${dept.id}">${shortenDepartmentString(
              dept.name,
              20
            )}</option>`
          );
        }
      });
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const createLocationDropdown = async (location) => {
  locationDirectoryQuery
    .readData('all')
    .then((response) => {
      response.forEach((loc) => {
        if (loc.name !== location) {
          $('#location-selector').append(
            `<option value="${loc.id}">${loc.name}</option>`
          );
        }
      });
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const updateLocationAndDepartmentSelectors = (locid, department) => {
  $('#location-selector').on('change', function () {
    let selectedLocation = $('#location-selector :selected').attr('value');
    $('#department-selector').empty();
    if (selectedLocation === '0') {
      $('#department-selector').append(
        `<option id="current-department" value="0" selected>${shortenDepartmentString(
          department,
          10
        )} (current)</option>`
      );
      updateProfileDepartmentList(locid, department);
    } else {
      updateProfileDepartmentList(selectedLocation, department);
    }
  });
};

const emailValidate = new RegExp(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

const nameValidate = new RegExp(
  `^[a-zA-Z'\-\pL]+(?:(?! {2})[a-zA-Z'\-\pL ])*[a-zA-Z'\-\pL]+$`
);

const handleEmailInput = (email) => {
  $('#email-info').replaceWith(
    `<label>Email: </label> <input id="email-input" style="width: 14em" value="${email}" spellcheck="false"></input>`
  );
  $('#email-input').on('keyup', function () {
    if (emailValidate.test($(this).val())) {
      $('#confirm-changes').removeAttr('disabled');
    } else {
      $('#confirm-changes').attr('disabled', true);
    }
  });
};

const addNewPersonToDatabase = async (
  firstName,
  lastName,
  email,
  department
) => {
  console.log(firstName, lastName, email, department);
  createNewStaffRecord
    .createData(firstName, lastName, email, department, 'personnel')
    .then((response) => {
      console.log(response);
    });
};

const handleOnboardInput = () => {
  let first = 0;
  let last = 0;
  let email = 0;
  $('#onboard-first-name').on('keyup', function () {
    console.log($(this).val());
    if (nameValidate.test($(this).val())) {
      console.log('first name validated');
      first = 1;
    } else {
      first = 0;
    }
  });
  $('#onboard-last-name').on('keyup', function () {
    console.log($(this).val());
    if (nameValidate.test($(this).val())) {
      console.log('last name validated');
      last = 2;
    } else {
      last = 0;
    }
  });
  $('#onboard-email').on('keyup', function () {
    console.log($(this).val());
    if (emailValidate.test($(this).val())) {
      console.log('email validated');
      email = 4;
    } else {
      console.log('not acceptable');
      email = 0;
    }
  });
  const validate = (total) => {
    console.log(total);
    if (total === 7) {
      $('#new-onboard').removeAttr('disabled');
      $('#new-onboard').on('click', function () {
        addNewPersonToDatabase(
          $('#onboard-first-name').val(),
          $('#onboard-last-name').val(),
          $('#onboard-email').val(),
          $('#department-selector.add :selected').attr('value')
        ).then((response) => {
          console.log(response);
          errorDisplay(
            {
              responseText: `Employee has been successfully added.`
            },
            'green'
          );
          $('#new-onboard').attr('disabled', true);
          $('#onboard-first-name').val(''),
            $('#onboard-last-name').val(''),
            $('#onboard-email').val('');
        });
      });
    } else {
      $('#new-onboard').attr('disabled', true);
    }
  };
  $('#page-content').on('keyup', function () {
    validate(first + last + email);
  });
};

const loadDashboard = () => {
  console.log('loading dashboard');
};

const loadReportsPage = () => {
  console.log('loading reports');
};

const loadOnboardPage = () => {
  $('#main-content').replaceWith(
    `<div id="page-content">
    <div id="form-container">
    <p class="body-text">
      To add a new person to the database, complete their details below and then
      click the <strong>Add Employee</strong> button.
    </p>
    <div>
      <div class="form-group">
        <label class="form-label" for="onboard-first-name">First Name</label>
        <input type="text" class="form-control" id="onboard-first-name" />
      </div>
      <div class="form-group">
        <label class="form-label" for="onboard-last-name">Last Name</label>
        <input type="text" class="form-control" id="onboard-last-name" />
      </div>
      <div class="form-group">
        <label class="form-label" for="onboard-email">Email</label>
        <input type="email" class="form-control" id="onboard-email" />
      </div>
      <div>
      <label class="form-label" for="location-selector">Location</label>
      <br>
      <select
      style="flex: 1; border-radius: 5px"
      class="custom-select add"
      id="location-selector"
    ></select></div>
    <div>
    <label class="form-label" for="department-selector">Department</label>
    <br>
    <select
      style="flex: 1; border-radius: 5px"
      class="custom-select add"
      id="department-selector"
    ></select>
    </div>
      <div class="custom-file">
        <label class="custom-file-label form-label" for="headshot-photo"
          >Upload headshot photo (max 100kb)</label
        >
        <input type="file" class="custom-file-input" id="headshot-photo" />
      </div>
      <button style="float: right; margin-right: -30px" id="new-onboard" class="btn btn-success" disabled>Add Employee</button>
    </div>
  </div></div>`
  );
  // $('#main-content').css('margin-top', '200px');
  // $('#main-content').css('overflow', 'hidden');
  // $('main').css('overflow', 'hidden');
  createLocationDropdown();
  updateProfileDepartmentList();
  updateLocationAndDepartmentSelectors();
  handleOnboardInput();
  scrollReset();
};

const mainDirectory = async (search, department) => {
  $('#main-directory').empty();
  personnelDirectoryQuery
    .readData(search, department)
    .then((response) => {
      response.forEach((person) => {
        $('#main-directory')
          .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${person.firstName} ${person.lastName}</div>
        <div class="card-body text-dark">
        <img class="headshot" id="${person.id}" src='images/staffpics/staffphoto_id${person.id}.jpg' width='50px' height='50px'/>
          <ul style="margin-left: 5px; margin-top: 5px">
          <li class="person-card-text"><b>Dept:</b> ${person.department}</li>
          <li class="person-card-text"><b>Location:</b> ${person.location}</li>
          <li class="person-card-text">${person.email}</li>
          </ul>
        </div>
      </div>`);
      });
      scrollReset();
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const departmentList = async () => {
  departmentDirectoryQuery.readData('all').then((response) => {
    response.forEach((department) => {
      $('#department-list')
        .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${department.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${department.id}" class="dept-section">
          </ul>
        </div>
      </div>`);
      departmentDirectoryQuery
        .readData(department.id, 'person')
        .then((response) => {
          response.forEach((departmentMember) => {
            $(`#personnel-dept-${department.id}`).append(
              `<div class="dept-photo headshot" id="${departmentMember.id}">
            <img src='images/staffpics/staffphoto_id${departmentMember.id}.jpg' 
            width="30px" height="30px"/>
            <span class="person-card-text">${departmentMember.firstName} ${departmentMember.lastName}</span></div>`
            );
          });
          scrollReset();
        })
        .catch((error) => {
          errorDisplay(error);
        });
    });
  });
};

const locationList = async () => {
  locationDirectoryQuery
    .readData('all')
    .then((response) => {
      response.forEach((location) => {
        $('#location-list')
          .append(`<div class="card border-dark mb-1" style="max-width: 100%;">
        <div class="card-header">${location.name}</div>
        <div class="dept-card-body text-dark">
          <ul id="personnel-dept-${location.id}" class="location-section">
          </ul>
        </div>
      </div>`);
        locationDirectoryQuery
          .readData(location.id)
          .then((response) => {
            response.forEach((locationMember) => {
              $(`#personnel-dept-${location.id}`).append(
                `<div class="location-photo headshot" id="${locationMember.id}">
            <img src='images/staffpics/staffphoto_id${locationMember.id}.jpg' width="30px" height="30px"/>
            <span class="person-card-text">${locationMember.firstName} ${locationMember.lastName} (${locationMember.department})</span></div>`
              );
            });
            scrollReset();
          })
          .catch((error) => {
            errorDisplay(error);
          });
      });
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const populateDepartmentSelector = () => {
  departmentDirectoryQuery.readData('all').then((response) => {
    response.forEach((department) => {
      $('#department-search-select').append(
        `<option id="${department.id}">${shortenDepartmentString(
          department.name,
          14
        )}</option>`
      );
    });
  });
};

const updateDirectoryList = () => {
  if ($('#person-file').length) {
    $('#person-file').remove();
    $('#main-content').html(
      `<ul id="main-directory" class="directory-content"></ul>`
    );
    $('.directory-content').css('margin-top', marginTop[1]);
  }
  mainDirectory(
    $('#name-search').val(),
    $('#department-search-select option:selected').attr('id')
  );
};

const toggleSearchBar = async () => {
  if (!visibleSearch) {
    $('.directory-content').css('margin-top', marginTop[1]);
    $('#main-content-header').append(`
            <div
          id="search-bar"
          style="margin-top: 3px; width: 100%; padding-right: 3px; display: flex"
        >
          <form class="form-inline" style="display: flex">
            <input
              style="flex: 1"
              id="name-search"
              class="form-control mr-sm-1"
              type="search"
              spellcheck="false"
              placeholder="Search"
              aria-label="Search"
            />
            <select
              style="flex: 1; border-radius: 5px"
              class="custom-select"
              id="department-search-select"
            >
              <option id="0" selected>All Departments</option>
            </select>
          </form>
        </div>`);
    populateDepartmentSelector();
    updateDirectoryList();

    $('#name-search').on('keyup', function () {
      updateDirectoryList();
    });
    $('#department-search-select').on('change', function () {
      updateDirectoryList();
    });
    visibleSearch = true;
  } else {
    $('#search-bar').remove();
    $('.directory-content').css('margin-top', marginTop[0]);
    visibleSearch = false;
  }
};

const updatePersonRecord = async (id, department, email) => {
  personnelUpdate
    .updateData(id, email, department)
    .then(() => {
      errorDisplay({ responseText: `Database Update Success` }, 'green');
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const loadPersonnelPage = () => {
  if ($('#page-content').length) {
    $('#page-content').replaceWith(`<div id="main-content"></div>`);
  }
  if (!$('#personnel-button-container').length) {
    $('#main-content-header').append(`
      <div id="personnel-button-container" class="nav nav-tabs">
      <button id="directory" class="personnel-button"><h3>Directory</h3></button>
      <button id="departments" class="personnel-button"><h3>Teams</h3></button>
      <button id="locations" class="personnel-button"><h3>Locations</h3></button>
      <img id="search-icon" src='images/icons/search.png'alt='search database' width='20px' height='20px'/>
      </div>`);
  }
  $('#search-icon').on('click', function () {
    toggleSearchBar();
  });

  const loadPersonnelTab = (tab) => {
    switch (tab) {
      case 'directory':
        $('#directory').focus();
        $('#main-content').html(
          `<ul id="main-directory" class="directory-content"></ul>`
        );
        mainDirectory('all_personnel');
        break;

      case 'departments':
        $('#departments').focus();
        $('#main-content').html(
          `<ul id="department-list" class="directory-content"></ul>`
        );
        departmentList();
        break;

      case 'locations':
        $('#locations').focus();
        $('#main-content').html(
          `<ul id="location-list" class="directory-content"></ul>`
        );
        locationList();
        break;

      default:
        return;
    }
  };

  loadPersonnelTab('directory');

  $('.personnel-button').on('click', function () {
    loadPersonnelTab($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
};

const editPerson = async (id, location, department, email, locid) => {
  const locationSelection = `<select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="location-selector"
    ><option id="current-location" value="0" selected>${location} (current)</option></select><br>`;
  const departmentSelection = `<select
    style="flex: 1; border-radius: 5px"
    class="custom-select"
    id="department-selector"
    ><option id="current-department" value="0" selected>${shortenDepartmentString(
      department,
      10
    )} (current)</option></select><br>`;
  $('#location-info').replaceWith(
    `<label>Location: </label> ${locationSelection}`
  );
  $('#department-info').replaceWith(
    `<label>Department: </label> ${departmentSelection}`
  );

  createLocationDropdown(location);
  updateProfileDepartmentList(locid, department);
  updateLocationAndDepartmentSelectors(locid, department);
  handleEmailInput(email);
};

const offboardPerson = async (id, name) => {
  $('#main-content-header')
    .append(`<div id="delete-person-warning" class="alert alert-danger" role="alert">
  You are about to offboard <b>${name}</b> and this action cannot be undone.
  Please confirm that you want to remove <b>${name}</b> from the company database.
  <div class="btn-group" role="group" aria-label="edit or offboard">
  <button id="confirm-delete-person"
      type="button" class="btn btn-primary">Confirm</button>
  <button id="cancel-delete-person" type="button" class="btn btn-danger">Cancel</button>
</div>
</div>`);
  $('#delete-person-warning').alert();
  $('#confirm-delete-person').on('click', function (e) {
    $('#delete-person-warning').remove();
    e.stopPropagation();

    deletePersonnel
      .deleteData('id', id)
      .then(() => {
        errorDisplay(
          {
            responseText: `${name} has been successfully removed from the database.`
          },
          'green'
        );
      })
      .catch((error) => {
        errorDisplay(error);
      });
  });
  $('#cancel-delete-person').on('click', function (e) {
    $('#delete-person-warning').remove();
    e.stopPropagation();
    errorDisplay({ responseText: `${name} has NOT been deleted.` }, 'green');
  });
};

const showPersonFile = async (id) => {
  idQuery
    .readData(id)
    .then((response) => {
      let person = response[0];
      $('#main-content').html(
        `<div class="card directory-content" id="person-file">
      <img
        class="card-img-top"
        src="images/staffpics/staffphoto_id${person.id}.jpg"
        alt="${person.firstName} ${person.lastName}"
      />
      <div id="person-file-body">
        <h2 class="card-title">${person.firstName} ${person.lastName}</h2>
        <ul id="person-file-info">
          <li id="location-info">Location: ${person.location}</li>
          <li id="department-info">Department: ${person.department}</li>
          <li id="email-info">Email: ${person.email}</li>
        </ul>
        <div class="btn-group" role="group" aria-label="edit or offboard">
        <button id="${person.id}" location="${person.location}" locid="${person.locid}" 
              dept="${person.department}" email="${person.email}"
            type="button" class="btn btn-primary edit">Edit Details</button>
        <button id="${person.id}" name="${person.firstName} ${person.lastName}" type="button" class="btn btn-secondary offboard">Offboard</button>
      </div>
    </div>`
      );
      $('.edit').on('click', function () {
        editPerson(
          $(this).attr('id'),
          $(this).attr('location'),
          $(this).attr('dept'),
          $(this).attr('email'),
          $(this).attr('locid')
        );
        $('.edit').replaceWith(
          `<button type="button" id="confirm-changes" class="btn btn-success confirm">Confirm</button>
        <button type="button" class="btn btn-danger cancel">Cancel</button>`
        );
        $('.confirm').on('click', function () {
          updatePersonRecord(
            person.id,
            $('#department-selector :selected').attr('value'),
            $('#email-input').val()
          );
          showPersonFile(person.id);
        });
        $('.cancel').on('click', function () {
          showPersonFile(person.id);
        });
      });
      $('.offboard').on('click', function () {
        offboardPerson($(this).attr('id'), $(this).attr('name'));
      });
      $('#search-bar').empty();
      $('.directory-content').css('margin-top', marginTop[0]);
      scrollReset();
    })
    .catch((error) => {
      errorDisplay(error);
    });
};

const loadPage = (pageId) => {
  switch (pageId) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'personnel':
      loadPersonnelPage();
      break;
    case 'reports':
      loadReportsPage();
      break;
    case 'onboard':
      loadOnboardPage();
      break;
    default:
      loadDashboard();
  }
};

$(document).ready(function () {
  $('.icon').on('click', function () {
    $('#page-title').text($(this).attr('value'));
    $('#main-content').empty();
    $('#personnel-button-container').remove();
    loadPage($(this).attr('id'));
    $('.directory-content').css('margin-top', marginTop[0]);
  });
  $(document).on('click', '.headshot', function () {
    showPersonFile($(this).attr('id'));
  });
});
