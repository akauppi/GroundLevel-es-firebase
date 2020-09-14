// .env.js
//
// Operational configuration. Gets merged to 'src/config.js' at build time.
//
// The values are used for 'dev:online' and production.
//
// NOTE: The values are *not* secret since they get exposed in the client. You can add the file to version control,
//      or provide the values directly in 'src/config.js'.
//
const airbrake = {
  //type: 'airbrake',
  //projectId: '123456',
  //projectKey: '...'
}

export { airbrake }
