const fs = require("fs");
const request = require("request");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const html = (bodyContent = '', headContent = '') => `<html lang="en">
<head><title>Serverless Express.js with Now v2</title><meta name="viewport" content="initial-scale=1,width=device-width,user-scalable=0"/><link rel="stylesheet" href="/style.css"/>${headContent}</head><body>
${bodyContent}</body></html>`;


function polylineToCoordinates(t, e) {
  for (
    var n,
      o,
      u = 0,
      l = 0,
      r = 0,
      d = [],
      h = 0,
      i = 0,
      a = null,
      c = Math.pow(10, e || 5);
    u < t.length;

  ) {
    (a = null), (h = 0), (i = 0);
    do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
    while (a >= 32);
    (n = 1 & i ? ~(i >> 1) : i >> 1), (h = i = 0);
    do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
    while (a >= 32);
    (o = 1 & i ? ~(i >> 1) : i >> 1),
      (l += n),
      (r += o),
      d.push([l / c, r / c]);
  }
  return (d = d.map(function(t) {
    return { latitude: t[0], longitude: t[1] };
  }));
}

function dateToText(date) {
  var dd = date.getDate();
  var mm = date.getMonth() + 1; //January is 0!
  var yyyy = date.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  var months = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC"
  ];

  return dd + "-" + months[mm - 1] + "-" + yyyy;
}

const isValidToken = async (req, res, next) => {
  try {
    await jwt.verify(req.headers["token"], process.env.APP_SECRET);
    next();
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = app => {
  app.get("/", (req, res) => {
    res.send("Backend Studio Mockserver v0.0.5");
  });

  app.get("/heartbeat", (req, res) => {
    res.send("I'm alive!");
  });


  app.get("/jivochat", (req, res) => {
    res.end(`<html>
<title>Chat Center Auto Conectado</title>

<head>
    <meta charset="utf-8" />
    <style>
        html,
        body {
            height: 100%;
            width: 100%;
            background: white;
        }
    </style>
    <script>
        jivo_config = {
            /*
                 "plane_color":"red",

                 "agentMessage_bg_color":'green', //цвет агентского сообщения
                 "agentMessage_txt_color":'blue', //цвет текста агентского сообщения

                 "clientMessage_bg_color":'yellow', //цвет клиентского сообщения
                 "clientMessage_txt_color":'black', //цвет текста клиентского сообщения
                */
            active_message: "¿En qué puedo ayudarte?",
            widget_id: "W3wEFsWUAR", //widget_id
            site_id: 204998, //site_id
            app_link: "Widget_Mobile_en", //ссылка, которая будет светиться у оператора
            placeholder: "Ingrese su mesaje"
        };
    </script>
    <script src="/jivochat-bundle.js"></script>
</head>

<body>
    <div id="chat"></div>
</body>

</html>`);
  });



  app.get("/api/test", (req, res) => {
    res.send("api is alive and kicking!");
  });

  //get the route from google maps direction from an origin to destination
  app.post("/api/get-travel-data", (req, res, next) => {
    const { origin, destination } = req.body;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
      origin.lat
    },${origin.lng}&destination=${destination.lat},${
      destination.lng
    }&mode=driving&alternatives=false&language=es&key=AIzaSyA_uVKWprjIgPURNhl1v9zzTPLQJIBdi6I`;
    console.log(url);

    var result = { status: 500, msg: "internal error" };

    const options = {
      url: url,
      json: true
    };

    request(options, (error, response, body) => {
      if (error) {
        console.log("error:", error); // Print the error if one occurred
      } else {
        if (body.status === "OK") {
          result.status = 200;
          result.msg = "GOOD";
          const leg = body.routes[0].legs[0];
          result.start_address = leg.start_address;
          result.end_address = leg.end_address;
          result.distance = leg.distance;
          result.duration = leg.duration;

          const coordinates = [];
          const accelerated_abrupt = [];
          const excess_speed = [];

          var index = 1;

          leg.steps.forEach(item => {
            let coords = polylineToCoordinates(item.polyline.points);
            coords.forEach(coord => {
              coordinates.push(coord);
              if (index % 600 === 0) {
                accelerated_abrupt.push({ coords: coord, speed: "90 km/h" });
              }
              if (index % 400 === 0) {
                excess_speed.push({ coords: coord, speed: "70 km/h" });
              }
              index++;
            });
          });
          result.coordinates = coordinates;
          result.accelerated_abrupt = accelerated_abrupt;
          result.excess_speed = excess_speed;
        } else {
          result.status = 201;
          result.msg = "ZERO_RESULTS";
        }
      }
      res.send(result);
    });
  });

  app.post("/api/get-travels", (req, res, next) => {
    const page = req.body.page;

    console.log("page", req.body);

    var d = new Date();

    if (page > 0) {
      d.setDate(d.getDate() - page * 10);
    }

    var tmp = [];
    for (var i = 10; i >= 0; i--) {
      d.setDate(d.getDate() - 1);

      tmp.push({
        date: dateToText(d),
        number: Math.floor(Math.random() * 5 + 1), //ramdom number between 1 and 5
        score: Math.floor(Math.random() * 70 + 30),
        points: `+${Math.floor(Math.random() * 150 + 50)} pts`
      });
    }
    res.send(tmp);
  });

  //fake login
  app.post("/api/login", async (req, res) => {
    try {
      console.log("SECRET", process.env.APP_SECRET);
      const fakeUser = {
        email: "test@test.com",
        password: "test"
      };

      const { email, password } = req.body;

      if (
        (fakeUser.email === email || email === "albertw05@hotmail.com") &&
        (fakeUser.password === password || password === "abc123")
      ) {
        const user = {
          id: Date.now(),
          name: "Fake",
          lastName: "User",
          email: "test@test.com"
        };

        const token = await jwt.sign(
          {
            id: user.id
          },
          process.env.APP_SECRET,
          { expiresIn: "1d" }
        );
        res.status(200).send({ token, ...user });
      } else {
        res.status(403).send({ msg: "Email o contreseña incorrectos" });
      }
    } catch (error) {
      res.status(500).send({ msg: error.message });
    }
  });

  //check if the user token is valid
  app.post("/api/check-session", isValidToken, async (req, res) => {
    //get the user data
    const user = {
      id: Date.now(),
      name: "Fake",
      lastName: "User",
      email: "test@test.com"
    };
    //return a new token
    const token = await jwt.sign(
      {
        id: user.id
      },
      process.env.APP_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).send({ token, ...user, msg: "ok" });
  });

  app.post("/api/get-list-of-notifications", (req, res) => {
    const loremIpsum = require("lorem-ipsum");
    const page = req.body.page;

    var d = new Date();

    console.log();

    if (page > 0) {
      d.setDate(d.getDate() - page * 10);
    }

    var tmp = [];

    for (var i = 10; i >= 0; i--) {
      const dt = d.setDate(d.getDate() - 1);
      tmp.push({
        date: new Date(dt),
        title: loremIpsum({ count: 1, units: "sentences" }),
        message: loremIpsum({ count: 1, units: "paragraphs" })
      });
    }
    res.send(tmp);
  });

  app.post("/api/send-push-notification", async (req, res, next) => {
    try {
      //you need to send as a data "to (string)" or "registration_ids (array of strings)" or "condition (strings)" but not all at the same time
      const {
        to,
        registration_ids,
        condition,
        body,
        title,
        content,
        type
      } = req.body;
      console.log("here");
      //body and title  are required
      /* Here an example
			to mutiples topic use   "condition": "'topic1' in topics || 'topic2' in topics",
			{
				"to":"/topics/auto-conectado-all-users",
				"title":"raw title",
				"body":"raw body",
				"content":"string"
			}
			 */

      if (!body || !title) throw new Error("missing title or body params");
      if (!to && !registration_ids && !condition)
        throw new Error("you need to provide to or registration_ids as params");

      //by default send the notification to all devices
      var data = {
        notification: {
          body,
          title
        },
        data: {
          body,
          priority: "high",
          title,
          type,
          content
        }
      };

      if (to) {
        //send notification to specific device by token or a specific topic
        data = {
          to,
          ...data
        };
      } else if (condition) {
        //send notification to multiples devices by an array of tokens
        data = { condition, ...data };
      } else if (registration_ids) {
        //send notification to multiples devices by an array of tokens
        data = { registration_ids, ...data };
      }

      //request to firebase FCM api
      const response = await axios({
        method: "post",
        url: "https://fcm.googleapis.com/fcm/send",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${process.env.FCM_SERVER_KEY}`
        },
        data
      });

      if (response.data.success > 0 || response.data.message_id) {
        res.status(200).send({ message: "notificacion enviada" });
      } else {
        console.log("error fcm", response.data);
        res.status(500).send({ errors: response.data.results });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
};
