// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  hmr: false,
  prefijoApp:"SEG",
  url_seguridad: 'http://localhost:8080/ased-servicios',
  //url_seguridad: 'https://spring.asedinfo.com/ased-servicios',
  url_wspAI: 'http://localhost:5000',
  //url_wspAI: 'https://whapp.asedinfo.com',
  url_wspND: 'http://localhost:5001',
  //url_wspND: 'https://whapp.newdanceec.com',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
