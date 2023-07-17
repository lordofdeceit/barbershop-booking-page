const services = [
  { name: 'Head Shave', duration: 40 },
  { name: 'Scrubbing', duration: 30 },
  { name: 'Massage', duration: 90 },
  { name: 'Beards', duration: 30 },
  { name: 'Hair Dye', duration: 40 }
];

const minTime = 30;

const bookings = [];

function generateTimeOptions() {
  const select = document.getElementById('time');
  select.innerHTML = '<option value="" disabled selected>Select a time</option>';

  const startTime = new Date(`2000-01-01T09:30:00`);
  const endTime = new Date(`2000-01-01T22:00:00`);
  const currentTime = new Date(startTime);

  while (currentTime <= endTime) {
    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const option = document.createElement('option');
    option.value = timeString;
    option.textContent = timeString;
    select.appendChild(option);

    // Increment current time by minTime minutes
    currentTime.setTime(currentTime.getTime() + minTime * 60000);
  }
}

function checkAvailability(timeOption) {
  const timeInput = document.getElementById('time');
  const availability = document.getElementById('availability');

  let selectedTime;
  
  if (timeOption) {
    // Use the given time option element
    selectedTime = new Date(`2000-01-01T${timeOption.value}:00`);
    // Reset availability text
    availability.textContent = '';
    availability.classList.remove('alert-danger');
    availability.classList.remove('alert-success');
  } else {
    // Use the selected time input value
    selectedTime = new Date(`2000-01-01T${timeInput.value}:00`);
  }

  
  const startTime = new Date(`2000-01-01T09:30:00`);
  const endTime = new Date(`2000-01-01T22:00:00`);

  let isAvailable = true;
  
  for (const service of services) {
    const serviceDuration = service.duration;
    const endTimeForService = new Date(selectedTime);
    endTimeForService.setMinutes(endTimeForService.getMinutes() + serviceDuration);

    if (endTimeForService > endTime) {
      // Service cannot be done after closing time
      isAvailable = false;
      break;
    }

    // Check if any booking overlaps with the service time
    for (const booking of bookings) {
      const bookingTime = new Date(`2000-01-01T${booking.time}:00`);
      const bookingEndTime = new Date(bookingTime);
      bookingEndTime.setMinutes(bookingEndTime.getMinutes() + booking.duration);

      if (
        selectedTime >= bookingTime &&
        selectedTime < bookingEndTime &&
        booking.services.includes(service.name)
      ) {
        // Service is already booked at this time
        isAvailable = false;
        break;
      }
    }
  }

  if (isAvailable) {
    if (!timeOption) {
      // Update availability text for selected time input
      availability.textContent = 'Available';
      availability.classList.remove('alert-danger');
      availability.classList.add('alert-success');
    } else {
      // Enable and style the time option element
      timeOption.disabled = false;
      timeOption.classList.remove('unavailable');
      timeOption.classList.add('available');
    }
  } else {
    if (!timeOption) {
      // Update availability text for selected time input
      availability.textContent = 'Unavailable';
      availability.classList.remove('alert-success');
      availability.classList.add('alert-danger');
    } else {
      // Disable and style the time option element
      timeOption.disabled = true;
      timeOption.classList.remove('available');
      timeOption.classList.add('unavailable');
    }
  }

  return isAvailable;
}

function updateBookingStatus(e) {
  e.preventDefault();

  const nameInput = document.getElementById('name');
  const timeInput = document.getElementById('time');
  const servicesInput = document.querySelectorAll('input[name="service"]:checked');

  const name = nameInput.value;
  const time = timeInput.value;
  const selectedServices = Array.from(servicesInput).map(input => input.value);

  // Calculate the total duration of the selected services
  let duration = 0;
  for (const service of services) {
    if (selectedServices.includes(service.name)) {
      duration += service.duration;
    }
  }

  // Create a booking object and push it to the bookings array
  const booking = { name, time, services: selectedServices, duration };
  bookings.push(booking);

  // Update the availability of the time options
  for (const option of document.querySelectorAll('select option')) {
    if (option.value !== '') {
      checkAvailability(option);
    }
  }

  // Display the bookings and the chart
  displayBookings();
  displayChart();

  // Reset the form inputs
  nameInput.value = '';
  timeInput.value = '';
  servicesInput.forEach(input => (input.checked = false));
}

function displayBookings() {
  const bookedServicesElement = document.getElementById('booked-services');

  // Create a table element with the booking details
  const table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-hover');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Time</th>
        <th>Services</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  // Loop through the bookings array and append a row for each booking
  for (const booking of bookings) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${booking.name}</td>
      <td>${booking.time}</td>
      <td>${booking.services.join(', ')}</td>
    `;
    table.querySelector('tbody').appendChild(row);
  }

  // Clear the bookedServicesElement and append the table to it
  bookedServicesElement.innerHTML = '';
  bookedServicesElement.appendChild(table);
}

function displayChart() {
  const openTimesElement = document.getElementById('open-times');

  // Create a canvas element for the chart
  const canvas = document.createElement('canvas');
  
   // Clear the openTimesElement and append the canvas to it
   openTimesElement.innerHTML = '';
   openTimesElement.appendChild(canvas);

   // Get the context of the canvas
   const ctx = canvas.getContext('2d');

   // Create an array of labels for each hour of operation
   const labels = [];
   for (let i = 9; i <=22; i++) {
     labels.push(`${i}:00`);
   }

   // Create an array of data for the number of open slots for each hour of operation
   const data = [];
   for (let i =0; i < labels.length; i++) {
     let count =0;
     for (const option of document.querySelectorAll('.available')) {
       if (option.value.startsWith(labels[i])) {
         count++;
       }
     }
     data.push(count);
   }

   // Create a bar chart using Chart.js library
   new Chart(ctx, {
     type: 'bar',
     data: {
       labels: labels,
       datasets: [{
         label: 'Open Slots',
         data: data,
         backgroundColor: 'rgba(0, 123, 255, 0.5)',
         borderColor: 'rgba(0, 123, 255, 1)',
         borderWidth: 1
       }]
     },
     options: {
       scales: {
         y: {
           beginAtZero: true
         }
       }
     }
   });
}

document.getElementById('time').addEventListener('change', checkAvailability);
document.getElementById('booking-form').addEventListener('submit', updateBookingStatus);

generateTimeOptions();
