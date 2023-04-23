import React, { useState, useEffect } from "react";
import socketIO from "socket.io-client";
import { useParams, Link } from "react-router-dom";

const socket = socketIO.connect("http://localhost:4000");

const Comment = () => {
  const { category, id } = useParams();
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    socket.on("comments", (data) => setCommentList(data));
  }, []);

  useEffect(() => {
    socket.emit("fetchComments", { category, id });
  }, [category, id]);

  const addComment = (e) => {
    e.preventDefault();
    socket.emit("addComment", {
      comment,
      category,
      id,
      userId: localStorage.getItem("userId"),
    });
    setComment("");
  };
  return (
    <div className="comments__container">
      <form className="comment__form" onSubmit={addComment}>
        <div className="commentTop_wrapper">
          <div className="backbtn">
            <Link to="/task">Go back</Link>
          </div>
        </div>
        <label htmlFor="comment">Add a comment</label>
        <textarea
          placeholder="Type your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          id="comment"
          name="comment"
          // required
        ></textarea>
        <button className="commentBtn">Comment</button>
      </form>

      <div className="comments__section">
        <h2>Existing Comments</h2>
        {commentList.map((comment) => (
          <div key={comment.id}>
            <p>
              <span style={{ fontWeight: "bold" }}>{comment.text} </span>by{" "}
              {comment.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
