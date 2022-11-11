import React from "react";
import styled from "styled-components";
import useInput from "../../hooks/UseInput";
import { io } from "socket.io-client";

const ChatRoom = () => {
  //   const socket = io("소켓주소");
  const [message, setMessage, onChange] = useInput();

  const onSubmitHandler = (e) => {
    // socket.emit("chatting" , message)
    e.preventDefault();
    console.log(message);
  };
  return (
    <ChatCtn onSubmit={onSubmitHandler}>
      <ChatInputBox>
        <ChatInput name="message" onChange={onChange} />
        <ChatBtn>전송</ChatBtn>
      </ChatInputBox>
    </ChatCtn>
  );
};

const ChatCtn = styled.form`
  width: 100%;
  height: 800px;
  background-color: aliceblue;
`;

const ChatInputBox = styled.div`
  margin: 0 auto;
  width: 90%;
  height: 60px;
  top: 720px;
  position: relative;
  display: flex;
  gap: 10px;
`;

const ChatInput = styled.input`
  border: none;
  border-radius: 20px;
  width: 90%;
  height: 60px;
  background-color: antiquewhite;
  margin: 0 auto;
`;

const ChatBtn = styled.button`
  width: 10%;
  height: 60px;
  border: none;
  border-radius: 10px;
  box-shadow: 0px 3px 3px 0px gray;
`;

export default ChatRoom;
