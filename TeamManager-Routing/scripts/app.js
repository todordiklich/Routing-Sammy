const auth = firebase.auth();
const databaseURL = `https://team-manager-6f161-default-rtdb.firebaseio.com/`;
const errorBoxElement = document.getElementById('errorBox');
const infoBoxElement = document.getElementById('infoBox');

//var database = firebase.database();

const router = Sammy('#main', function () {
  this.use('Handlebars', 'hbs');
  // this.use('Handlebars', 'hbs');  // let Sammy know how to use the .hbs extensions files

  // all the partials inside hbs => diff 'variables' and i can get each of them
  // with context.loginForm (EX) it will give me the loginForm from loginPage (context is a random
  // variable the name can be whatever i want )

  //GET
  this.get('/home', function (context) {
    verifyUser(context);

    this.loadPartials({
      header: './templates/common/header.hbs',
      footer: './templates/common/footer.hbs',
    })
      .then(function () {
        this.partial('./templates/home/home.hbs');
      })
      .catch((e) => errorHandler(e));
  });

  this.get('/about', function (context) {
    verifyUser(context);
    this.loadPartials({
      header: './templates/common/header.hbs',
      footer: './templates/common/footer.hbs',
    })
      .then(function () {
        this.partial('./templates/about/about.hbs');
      })
      .catch((e) => errorHandler(e));
  });

  this.get('/register', function (context) {
    this.loadPartials({
      header: './templates/common/header.hbs',
      footer: './templates/common/footer.hbs',
      registerForm: './templates/register/registerForm.hbs',
    })
      .then(function () {
        this.partial('./templates/register/registerPage.hbs');
      })
      .catch((e) => errorHandler(e));
  });

  this.get('/login', function (context) {
    this.loadPartials({
      header: './templates/common/header.hbs',
      footer: './templates/common/footer.hbs',
      loginForm: './templates/login/loginForm.hbs',
    })
      .then(function () {
        this.partial('./templates/login/loginPage.hbs');
      })
      .catch((e) => errorHandler(e));
  });

  this.get('/logout', function (context) {
    sessionStorage.removeItem('userData');

    this.redirect('/home')
      .then(function () {
        showTimeoutMessage(infoBoxElement, 'You have logged out!');
      })
      .catch((e) => errorHandler(e));
  });

  this.get('/catalog', function (context) {
    verifyUser(context);

    this.loadPartials({
      header: './templates/common/header.hbs',
      footer: './templates/common/footer.hbs',
      team: './templates/catalog/team.hbs',
    })
      .then(function () {
        this.partial('./templates/catalog/teamCatalog.hbs');
      })
      .catch((e) => errorHandler(e));
  });

  //POST
  this.post('/register', function (context) {
    const { username, password, repeatPassword } = context.params;

    if (password !== repeatPassword) {
      showTimeoutMessage(errorBoxElement, 'The passwords does not match!');
    }

    auth
      .createUserWithEmailAndPassword(username, password)
      .then(() => {
        this.redirect('/login');
      })
      .catch(errorHandler(e));
  });

  this.post('/login', function (context) {
    const { email: username, password } = context.params;

    auth
      .signInWithEmailAndPassword(username, password)
      .then((user) => {
        sessionStorage.setItem('userData', JSON.stringify(user));
        context.loggedIn = true;
        this.redirect('/home');
      })
      .catch(errorHandler(e));
  });
});

router.run('/home');

function verifyUser(context) {
  let user = JSON.parse(sessionStorage.getItem('userData'));

  if (user) {
    context.loggedIn = true;
    context.hasNoTeam = true;
    context.email = user.user.email;
  }
}

function errorHandler(e) {
  showTimeoutMessage(errorBoxElement, e.message);
}

function showTimeoutMessage(element, message) {
  element.innerText = message;
  element.style.display = 'block';

  setTimeout(() => {
    element.innerText = '';
    element.style.display = 'none';
  }, 3000);
}
