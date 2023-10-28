export const environment = {
  production: true,
  backendUrl: '/api',
  firebaseConfig: {
    apiKey: 'AIzaSyCHKc-9GFvrbXMKLlgua2yAtgCibPLddh8',
    authDomain: 'budget-planner-7eddb.firebaseapp.com',
    projectId: 'budget-planner-7eddb',
    appId: '1:278151755192:web:227ae9460314c348be4b4d',
  },
};

// Konfiguration für den Entwicklungsmodus
if (!environment.production) {
  environment.firebaseConfig = {
    apiKey: "AIzaSyCHKc-9GFvrbXMKLlgua2yAtgCibPLddh8",
    authDomain: "budget-planner-7eddb.firebaseapp.com",
    projectId: "budget-planner-7eddb",
    appId: "1:278151755192:web:227ae9460314c348be4b4d",
  };
}

console.log("Aktuelle Umgebungskonfiguration: ", environment);
