const express = require("express");
const { use } = require("express/lib/application");
const res = require("express/lib/response");
const { home } = require("nodemon/lib/utils");
const { password } = require("pg/lib/defaults");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const port = 8080;

const db = require("./connection/db");
const { redirect } = require("express/lib/response");
const upload = require("./middlewares/fileUpload");

app.set("view engine", "hbs"); //set view engine

app.use("/public", express.static(__dirname + "/public")); //set path folder public
app.use("/uploads", express.static(__dirname + "/uploads")); //set path folder upload gambar
app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(
  session({
    secret: "session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 2 jam
    },
  })
);

// ------------------------------------------------------HOMEPAGE-------------------------------------------------------//
app.get("/home", function (req, res) {
  // console.log(blogs);

  if (req.session.isLogin) {
    const userid = req.session.user.id;
    const query = `SELECT tb_projects.id, tb_projects.author_id, tb_user.name as author, tb_projects.name, start_date, end_date, description, technologies, image
	FROM tb_projects LEFT JOIN tb_user ON tb_projects.author_id = tb_user.id WHERE author_id=${userid}`;

    db.connect(function (err, client, done) {
      if (err) throw err;

      client.query(query, function (err, result) {
        if (err) throw err;
        let data = result.rows;

        data = data.map(function (item) {
          return {
            ...item,
            isLogin: req.session.isLogin,
            projectName: item.name,
            author: item.author,
            description: item.description,
            startDate: getFullTime(item.start_date),
            endDate: getFullTime(item.end_date),
            duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
            nodejs: checkboxes(item.technologies[0]),
            reactjs: checkboxes(item.technologies[1]),
            java: checkboxes(item.technologies[2]),
            python: checkboxes(item.technologies[3]),
          };
        });

        console.log(req.session.user);
        res.render("index", { isLogin: req.session.isLogin, user: req.session.user, blogs: data });
      });
    });
  } else {
    const query = `SELECT tb_projects.id, tb_projects.author_id, tb_user.name as author, tb_projects.name, start_date, end_date, description, technologies, image
    FROM tb_projects LEFT JOIN tb_user ON tb_projects.author_id = tb_user.id`;

    db.connect(function (err, client, done) {
      if (err) throw err;

      client.query(query, function (err, result) {
        if (err) throw err;
        let data = result.rows;

        data = data.map(function (item) {
          return {
            ...item,
            isLogin: req.session.isLogin,
            projectName: item.name,
            author: item.author,
            description: item.description,
            startDate: getFullTime(item.start_date),
            endDate: getFullTime(item.end_date),
            duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
            nodejs: checkboxes(item.technologies[0]),
            reactjs: checkboxes(item.technologies[1]),
            java: checkboxes(item.technologies[2]),
            python: checkboxes(item.technologies[3]),
          };
        });

        console.log(req.session.user);
        res.render("index", { isLogin: req.session.isLogin, user: req.session.user, blogs: data });
      });
    });
  }
});

let blogs = [];

// -----------------------------------------------ADD-BLOG-------------------------------------------------------//
app.get("/add-blog", function (req, res) {
  res.render("add-blog", { isLogin: req.session.isLogin, user: req.session.user });
});

app.post("/add-blog", upload.single("image"), function (req, res) {
  let data = req.body;
  const userid = req.session.user.id;
  const images = req.file.filename;

  db.connect(function (err, client, done) {
    if (err) throw err;
    done();

    client.query(
      `INSERT INTO public.tb_projects (name, start_date, end_date, description, technologies, image, author_id) VALUES ('${data.projectName}','${data.startDate}' ,'${data.endDate}', '${data.description}','{"${data.nodejs}", "${data.reactjs}", "${data.java}", "${data.python}"}','${images}', '${userid}')`,
      function (err, result) {}
    );

    data = {
      projectName: data.projectName,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      duration: getDistanceTime(data.startDate, data.endDate),
      nodejs: checkboxes(data.nodejs),
      reactjs: checkboxes(data.reactjs),
      java: checkboxes(data.java),
      python: checkboxes(data.python),
    };

    // blogs.push(data);
    // console.log(data);
    res.redirect("/home");
  });
});
// ---------------------------------------------FUNCTION WAKTU------------------------------------------------------//
function getDistanceTime(start, end) {
  let startDate = new Date(start);
  let endDate = new Date(end);

  let distance = endDate - startDate;

  let miliseconds = 1000;
  let secondInHours = 3600;
  let hoursInDay = 24;
  let dayInMonth = 31;
  let monthInYear = 12;

  let distanceYear = Math.floor(distance / (miliseconds * secondInHours * hoursInDay * dayInMonth * monthInYear)); //math.ceil bulatkan ke atas
  let distanceMonth = Math.floor(distance / (miliseconds * secondInHours * hoursInDay * dayInMonth));
  let distanceDay = Math.floor(distance / (miliseconds * secondInHours * hoursInDay));
  let distanceHours = Math.floor(distance / (miliseconds * 60 * 60));
  let distanceMinutes = Math.floor(distance / (miliseconds * 60));
  let distanceSeconds = Math.floor(distance / miliseconds);

  if (distanceYear > 0) {
    return `${distanceYear} Year`;
  } else if (distanceMonth > 0) {
    return `${distanceMonth} Month`;
  } else if (distanceDay > 0) {
    return `${distanceDay} day`;
  } else if (distanceHours > 0) {
    return `${distanceHours} hours`;
  } else if (distanceMinutes > 0) {
    return `${distanceMinutes} minutes`;
  } else {
    return `${distanceSeconds} seconds`;
  }
}

function getFullTime(waktu) {
  let month = ["Januari", "Febuari", "March", "April", "May", "June", "July", "August", "Sept", "October", "November", "December"];

  let date = waktu.getDate().toString().padStart(2, "0");

  let monthIndex = (waktu.getMonth() + 1).toString().padStart(2, "0");

  let year = waktu.getFullYear();

  let hours = waktu.getHours();

  let minutes = waktu.getMinutes();

  // let dateTime = `${date} ${month[monthIndex]} ${year}`;

  let fullTime = `${year}-${monthIndex}-${date}`;

  return fullTime;
}
// -------------------------------------DETAIL-BLOG-------------------------------------------------------//

app.get("/detail-blog/:id", function (req, res) {
  const id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(`SELECT * FROM tb_projects WHERE id = ${id}`, function (err, result) {
      let data = result.rows;
      if (err) throw err;
      done();

      data = data.map(function (item) {
        return {
          ...item,
          projectName: item.name,
          description: item.description,
          startDate: getFullTime(item.start_date),
          endDate: getFullTime(item.end_date),
          duration: getDistanceTime(new Date(item.start_date), new Date(item.end_date)),
          nodejs: checkboxes(item.technologies[0]),
          reactjs: checkboxes(item.technologies[1]),
          java: checkboxes(item.technologies[2]),
          python: checkboxes(item.technologies[3]),
        };
      });

      res.render("detail-blog", { blogs: data });
      console.log(result.rows);
    });
  });
});
// ----------------------------------------------------UPDATE-BLOG------------------------------------------------------//
app.get("/update-blog/:id", function (req, res) {
  let id = req.params.id;

  db.connect((err, client, done) => {
    if (err) throw err;

    client.query(`SELECT * FROM tb_projects WHERE id = ${id}`, (err, result) => {
      if (err) throw err;
      done();
      let data = result.rows[0];
      data.start_date = getFullTime(data.start_date);
      data.end_date = getFullTime(data.end_date);
      data.nodejs = checkboxes(data.technologies[0]);
      data.reactjs = checkboxes(data.technologies[1]);
      data.java = checkboxes(data.technologies[2]);
      data.python = checkboxes(data.technologies[3]);
      console.log(result.rows);
      res.render("update-blog", { update: data, id });
    });
  });
});

app.post("/update-blog/:id", upload.single("image"), function (req, res) {
  let data = req.body;
  let id = req.params.id;
  const userid = req.session.user.id;
  const images = req.file.filename;

  db.connect(function (err, client, done) {
    if (err) throw err;
    done();

    client.query(
      `UPDATE public.tb_projects SET  name='${data.projectName}', "start_date"='${data.start_date}', "end_date"='${data.end_date}',
       description='${data.description}', technologies='{${data.nodejs}, ${data.reactjs}, ${data.java}, ${data.python}}', image='${images}'
      WHERE id=${id}`,
      function (err, result) {
        if (err) throw err;

        res.redirect("/home");
      }
    );
  });
});

// condition icon tech
function checkboxes(render) {
  if (render == "true") {
    return true;
  } else {
    return false;
  }
}

// ------------------------------------------DELETE BLOG-------------------------------------------------- //

app.get("/delete-blog/:id", function (req, res) {
  const id = req.params.id;

  const query = `DELETE FROM tb_projects WHERE id=${id}`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      res.redirect("/home");
    });
  });
});

// ------------------------------------------CONTACT ME-------------------------------------------------- //

app.get("/form", function (req, res) {
  res.render("form");
});

// ------------------------------------------REGISTER BLOG-------------------------------------------------- //
app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  let data = req.body;

  const saltRound = 10; //hashed encrypt
  const hashed = bcrypt.hashSync(data.password, saltRound);
  // console.log("password encrypt", hashed);

  const emaildb = `SELECT * FROM tb_user WHERE email='${data.email}'`;

  const query = `INSERT INTO tb_user (name, email, password) VALUES ('${data.name}', '${data.email}', '${hashed}');`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(emaildb, function (err, result) {
      if (err) throw err;
      done();
      if (result.rows.length > 0) {
        req.flash("danger", "Email Already Taken");
        return res.redirect("/register");
      } else {
        client.query(query, function (err, result) {
          if (err) throw err;
          req.flash("success", "Success creating an account, please log in");
          return res.redirect("/login");
        });
      }
    });
  });

  console.log(data);
});
// ---------------------------------------------LOGIN BLOG-------------------------------------------------- //

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  let data = req.body;
  const query = `SELECT * FROM tb_user WHERE email ='${data.email}';`;

  db.connect(function (err, client, done) {
    if (err) throw err;

    client.query(query, function (err, result) {
      if (err) throw err;
      done();

      // console.log(result.rows);

      if (result.rows.length == 0) {
        // console.log("email invalid");
        req.flash("danger", "Email or Password Invalid");

        return res.redirect("/login");
      }

      const isMatch = bcrypt.compareSync(data.password, result.rows[0].password);
      // console.log(isMatch);

      if (isMatch) {
        // console.log("login valid");

        //input data to session
        (req.session.isLogin = true),
          (req.session.user = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
          });

        req.flash("success", "login Success");
        res.redirect("/home");
      } else {
        // console.log("login invalid");
        req.flash("danger", "login Invalid");
        res.redirect("/login");
      }
    });
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/home");
});

app.listen(port, function () {
  console.log(`listening server on port ${port}`);
});
