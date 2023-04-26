import React from "react";
import AddTask from "./AddTask";
import Nav from "./Nav";
import TaskContainer from "./TasksContainer";
import socketIO from "socket.io-client";

// const socket = socketIO.connect("http://localhost:4000");
const socket = socketIO.connect("https://kanbanboard-hrm4.onrender.com/");

const Task = () => {
  return (
    <div>
      <Nav />
      {/*Passing socket.io  ↓   into the componenets that require connection with server */}
      <AddTask socket={socket} />
      <TaskContainer socket={socket} />
    </div>
  );
};

export default Task;
