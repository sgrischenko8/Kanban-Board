export function getDaysAgo(dateString) {
  //   const dateString = '2024-02-01T18:44:02Z';

  // Convert the date string to a Date object
  const startDate = new Date(dateString);

  // Get the current date
  const currentDate = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate - startDate;

  // Convert milliseconds to days
  const daysElapsed = timeDifference / (1000 * 60 * 60 * 24);

  return Math.ceil(daysElapsed);
}
