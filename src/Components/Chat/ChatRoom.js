import React, { useEffect, useState } from "react";
import styled from "styled-components";
import useInput from "../../hooks/UseInput";
import { io } from "socket.io-client";
import ChatMessage from "./ChatMessage";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FireNotification from "../../tools/useNotification";
import { userApi } from "../../instance";
import { setCookie } from "../../hooks/CookieHook";
import { postApi } from "../../instance";
import moment from "moment-timezone";
import "moment/locale/ko";
import { BiAlignRight } from "react-icons/bi";
import { AiOutlineNotification } from "react-icons/ai";

const ChatRoom = () => {
  // const socket = io("https://www.iceflower.shop/");
  const socket = io("https://www.iceflower.shop/");
  //웹소켓으로만 통신하고싶을때
  // {
  //   transports: ["websocket"],
  // }
  const { roomid } = useParams();
  const [message, setMessage, onChange] = useInput();
  const [notice, setNotice] = useState([]);
  const [users, setUsers] = useState([]);
  const [isEdit, SetisEdit] = useState(false);
  const scrollRef = useRef();
  const [chatArr, setChatArr] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState();
  const [detail, setDetail] = useState();

  const moment = require("moment-timezone");
  const getStartTime = (startDate) => {
    var m = moment(startDate).tz("Asia/Seoul").locale("ko");
    return m.format("MM.DD (ddd) HH:mm");
  };
  const RoomTime = getStartTime(detail?.time[0]);

  // axios로 채팅db가져오기
  const getChat = async () => {
    try {
      const { data } = await axios.get(
        `https://www.iceflower.shop/chats/${roomid}`
      );
      if (data.updateSocket.chat) setChatArr(data.updateSocket.chat);
    } catch (error) {}
  };
  const getUser = async () => {
    try {
      const { data } = await userApi.getUser();
      console.log(data);
      if (data.myNewToken) {
        setCookie("accessToken", data.myNewToken);
        setUser(data.findUser);
      } else {
        setUser(data.findUser);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
    getChat();
    postApi.getDetailId(roomid).then((res) => {
      setDetail(res.data.data);
    });
  }, []);

  //채팅이 갱신될때마다 맨 밑으로 내리기
  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatArr]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    socket.emit("chatMessage", {
      nickName: user.nickName,
      message: message.message,
      room: roomid,
    });

    setMessage({ message: "" });
  };

  const roomsubmit = () => {
    socket.emit("joinRoom", {
      nickName: user?.nickName,
      room: roomid,
    });
  };

  const ban = (user) => {
    socket.emit("ban", {
      nickName: user?.nickName,
      room: roomid,
    });
    console.log("ban");
  };

  const navigate = useNavigate();

  const exithandler = () => {
    socket.emit("leave-room", {
      nickName: user?.nickName,
      room: roomid,
    });
    navigate("/main");
  };

  useEffect(() => {
    console.log("render!");
    roomsubmit();
    // socket.emit("joinRoom", { username: 여기에 유저아이디가 들어가야할듯 , room: 여기에는 포스트아이디 });
    socket.on("roomUsers", (msg) => {
      setUsers(msg.nickName);
    });

    socket.on("message", (message) => {
      setChatArr((chatArr) => [...chatArr, message]);
    });
    socket.on("disconnect", (msg) => {});
    socket.on("notice", (msg) => {
      console.log("서버에서의 notice", msg);
      FireNotification("서버에서의 notice", {
        body: msg,
      });
    });
  }, []);
  return (
    <>
      <Wrapper>
        <UserWrap
          isEdit={isEdit}
          onClick={() => {
            SetisEdit(!isEdit);
          }}
        >
          <UserCtn onClick={(e) => e.stopPropagation()} isEdit={isEdit}>
            {users?.map((user) => {
              return (
                <UserBox>
                  <div>{user}</div>
                  <button
                    onClick={() => {
                      ban(user);
                    }}
                  >
                    밴
                  </button>
                </UserBox>
              );
            })}
          </UserCtn>
        </UserWrap>
        <ChatHeader>
          <Arrow className="left" onClick={() => exithandler()}></Arrow>
          <div className="headtxt">{detail?.title}</div>

          <BiAlignRight size="24" onClick={() => SetisEdit(!isEdit)} />
        </ChatHeader>{" "}
        <RoomInfoHeader onClick={() => setIsOpen(!isOpen)}>
          <div className="infotitle">
            <AiOutlineNotification size="20" />
            파티 정보
          </div>{" "}
          <Arrow className={isOpen && "UpArrow"} />
        </RoomInfoHeader>
        {isOpen && (
          <RoomInfo>
            <>
              <RoomBox>
                {" "}
                <RoomBoxTitle>
                  {" "}
                  <div>주최자</div>
                  <div>장소</div>
                  <div>일자</div>
                </RoomBoxTitle>
                <div>
                  <div>{detail?.nickName} 님</div>
                  <div>{detail?.cafe}</div>
                  <div>{RoomTime}</div>
                </div>
              </RoomBox>

              <RoomBtn onClick={() => setIsOpen(false)}>접어두기</RoomBtn>
            </>
          </RoomInfo>
        )}
        <ChatCtn>
          {chatArr?.map((chat) => {
            return <ChatMessage name={user?.nickName} chat={chat} />;
          })}
          <div style={{ height: "0px" }} ref={scrollRef} />
        </ChatCtn>{" "}
        <ChatInputBox onSubmit={onSubmitHandler}>
          <ChatInput
            value={message?.message}
            name="message"
            onChange={onChange}
          />
          <ChatBtn>전송</ChatBtn>
        </ChatInputBox>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ChatHeader = styled.div`
  color: white;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px;
  height: 6%;
  .headtxt {
    margin-left: 20px;
    color: #fff;
    text-shadow: 0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #d90368,
      0 0 82px #d90368, 0 0 92px #d90368, 0 0 102px #d90368, 0 0 151px #d90368;
  }
`;

const RoomInfo = styled.div`
  position: absolute;
  top: 9%;
  width: 90%;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 10px 20px;
  background-color: #ddd;
  gap: 20px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
`;

const RoomInfoHeader = styled.div`
  z-index: 10;
  display: flex;
  position: absolute;
  width: 90%;
  top: 6%;
  height: 5%;
  align-items: center;
  justify-content: space-between;
  background-color: #ddd;
  padding: 0px 30px;
  border-radius: 15px;
  .infotitle {
    display: flex;
    gap: 10px;
  }
`;

const RoomBox = styled.div`
  display: flex;
  gap: 20px;
`;
const RoomBoxTitle = styled.div`
  margin-left: 20px;
`;

const RoomBtn = styled.div`
  width: 100%;
  border-radius: 10px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const Arrow = styled.div`
  display: inline-block;
  border: 10px solid transparent;
  border-top-color: black;
  margin-top: 12px;
  &.left {
    border-top-color: white;
    margin-top: 0px;
    transform: rotate(90deg);
  }
  &.UpArrow {
    transform: rotate(180deg);
    margin-bottom: 25px;
  }
`;

const UserBtn = styled.div`
  cursor: pointer;
`;

const UserWrap = styled.div`
  width: ${({ isEdit }) => (isEdit ? "100%" : "0px")};
  z-index: 998;
  position: absolute;
  height: 95vh;
  background-color: rgba(0, 0, 0, 0.4); ;
`;

const UserCtn = styled.div`
  z-index: 90;
  display: flex;
  flex-direction: column;
  position: fixed;
  width: ${({ isEdit }) => (isEdit ? "70%" : "0px")};
  height: 95vh;
  padding: 20% 0%;
  right: 0px;
  background-color: #dddddd;
  transition: width 400ms ease-in-out;
`;
const UserList = styled.div`
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: white;
  z-index: 99;
`;
const UserBox = styled.div`
  padding: 10px 20px;
  color: #2e294e;
  background-color: #dddddd;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;
const ChatCtn = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 40px 10px;
  overflow: hidden;
  overflow-y: scroll;
`;

const ChatInputBox = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 0px;
  gap: 20px;
  background-color: #ddd;
`;

const ChatInput = styled.input`
  color: #ddd;
  margin-left: 10%;
  border: none;
  border-radius: 20px;
  padding: 0px 20px;
  width: 70%;
  height: 40px;
  background-color: #2e294e;
`;

const ChatBtn = styled.button`
  position: relative;
  right: 10%;
  width: 10%;
  max-width: 42.8px;
  height: 40px;
  border: none;
  border-radius: 100%;
  box-shadow: 0px 3px 3px 0px gray;
`;

export default ChatRoom;
