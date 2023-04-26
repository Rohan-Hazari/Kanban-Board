const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require("dotenv").config();

const http = require("http").Server(app);
const cors = require("cors");
const socketIO = require("socket.io")(http, {
  cors: { orgin: "http://localhost:3000" },
});
app.use(cors());

socketIO.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);

  //  ****************DRAG AND DROP ******************

  socket.on("taskDragged", (data) => {
    // console.log(data);
    const { source, destination } = data;

    const itemMoved = {
      ...tasks[source.droppableId].items[source.index],
    };
    // ...tasks[source.droppableId] => is nothing but the 3 highest property in our task object i.e pending,ongoing,completed
    // so its ...tasks => is tasks object destructured
    // source.droppableId => pending or ongoing or completed we provide this ID in client side
    // .item[source.index] => gives the array element/object from items property
    // console.log(itemMoved);

    // removing the dragged item from its source
    tasks[source.droppableId].items.splice(source.index, 1);
    // adding the dragged item to the desitnation
    tasks[destination.droppableId].items.splice(
      destination.index,
      0,
      itemMoved
    );

    // emits the "tasks" event with tasks as argument to all connected clients
    socket.emit("tasks", tasks);
  });

  // **************CREATE TASK*****************

  socket.on("createTask", (data) => {
    const newTask = { id: fetchID(), title: data.task, comments: [] };
    tasks["pending"].items.push(newTask);
    socket.emit("tasks", tasks);
  });

  // ****************ADD COMMENT***************

  socket.on("addComment", (data) => {
    const { category, userId, comment, id } = data;

    const taskItems = tasks[category].items;
    // tasks[category].items => gives the items array consisting of id.title and comments[]
    const resp = taskItems.map((item) => {
      if (item.id === id) {
        item.comments.push({
          name: userId,
          text: comment,
          id: fetchID(),
        });
        socket.emit("comments", item.comments);
      }
    });
  });

  // ********** FETCH COMMENTS **************
  socket.on("fetchComments", (data) => {
    const { category, id } = data;
    const taskItems = tasks[category].items;
    for (let i = 0; i < taskItems.length; i++) {
      if (taskItems[i].id === id) {
        socket.emit("comments", taskItems[i].comments);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("A user Disconnected");
  });
});

const fetchID = () => Math.random().toString(36).substring(2, 10);

let tasks = {
  pending: {
    title: "pending",
    items: [
      {
        id: fetchID(),
        title: "Complete your assignments",
        comments: [],
      },
    ],
  },
  ongoing: {
    title: "ongoing",
    items: [
      {
        id: fetchID(),
        title: "Completing Node course",
        comments: [
          {
            name: "rohan",
            text: "Be sure to complete is fast rohan",
            id: fetchID(),
          },
        ],
      },
    ],
  },
  completed: {
    title: "completed",
    items: [
      {
        id: fetchID(),
        title: "Create technical contents",
        comments: [
          {
            name: "Dima",
            text: "Make sure you check the requirements",
            id: fetchID(),
          },
        ],
      },
    ],
  },
};

app.get("/api", (req, res) => {
  res.json(tasks);
});

const PORT = process.env.PORT || 4000;

http.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});
