import React, { useEffect, useState } from "react";
import { userApi } from "../../instance";
import styled from "styled-components";
import useInput from "../../hooks/UseInput";
import { getCookie, setCookie, removeCookie } from "../../hooks/CookieHook";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiFillEye } from "@react-icons/all-files/ai/AiFillEye";
import { AiFillEyeInvisible } from "@react-icons/all-files/ai/AiFillEyeInvisible";
import { ImExit } from "@react-icons/all-files/im/ImExit";
import { ReactComponent as Avatar } from "../../Assets/Avatar/Standard.svg";
import ReactDaumPost from "react-daumpost-hook";
import { useRef } from "react";
import MyPartyItem from "./MyPartyItem";
import { postsApi } from "../../instance";
import AvatarBox from "../Avatar/AvatarBox";
import Loading from "../../style/Loading";
import EditUser from "./EditUser";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import AlertModal from "../AlertModal";

const MyPage = () => {
  const [user, setUser, onChange] = useInput();
  const [isOpen, SetisOpen] = useState(false);
  const [isOpen1, SetisOpen1] = useState(false);
  const [isOpen2, SetisOpen2] = useState(false);
  const [reservedParty, setReservedParty] = useState();
  const [confirmParty, setConfirmParty] = useState();
  const [bookmark, setBookmark] = useState([]);
  const [likeGame, setLikeGame] = useState();
  const [openEdit, setOpenEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(false);
  const [content, setContent] = useState();
  const [address, setAddress] = useState();
  const [ModalOpen, setModalOpen] = useState();
  const [dupNickName, setDupNickName] = useState(false);
  const [initialUser, setinitialUser] = useState();
  const [confirmAlert, setConfirmAlert] = useState(false);
  const [confirmAdress, setconfirmAdress] = useState();
  const [confirmContent, setconfirmContent] = useState();
  const [cancelContent, setcancelContent] = useState();
  const [cancelAddress, setcancelAddress] = useState();

  const navigate = useNavigate();

  //---------- 1초 로딩 후 렌더  ------------
  useEffect(() => {
    getUser();
  }, [setModalOpen, ModalOpen]);
  //? -----------------  API  -----------------------

  const getUser = async () => {
    try {
      const { data } = await userApi.getUser();
      console.log(data);
      setinitialUser(data.findUser);
      setLikeGame(data.findUser.likeGame);
      setUser(data.findUser);
      setReservedParty(data.partyReserved);
      setConfirmParty(data.partyGo);
      setBookmark(data.findUser.bookmarkData);
      setTimeout(() => setIsLoading(false), 700);
    } catch (error) {
      if (!sessionStorage.getItem("accessToken")) {
        setAlert(true);
        setContent("로그인이 필요한 페이지입니다!");
      }
      console.log(error);
    }
  };

  const editUser = async () => {
    if (user.nickName.trim(" ") && user.nickName !== initialUser.nickName) {
      try {
        const { data } = await userApi.editUser(user);
        console.log(data.findUserData);
        setUser(data.findUserData);
      } catch (error) {
        console.log(error);
      }
    }
  };

  //? ------------------  로그아웃 -------------------

  const logoutHandler = () => {
    setAlert(true);
    setContent("로그아웃 하시겠습니까?");
    setconfirmContent("로그아웃");
    setcancelContent("취소");
    setconfirmAdress("/");
  };

  //? --------------------  회원탈퇴  ---------------------

  const deleteUser = async () => {
    try {
      const { data } = await axios.delete(
        `${process.env.REACT_APP_BACK_SERVER}/users`,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deletUserHandler = () => {
    setAlert(true);
    setContent("회원 탈퇴하시겠습니까?");
    setconfirmContent("탈퇴");
    setcancelContent("취소");
    setconfirmAdress("/");
  };

  const confirmFunction = () => {
    if (confirmContent === "탈퇴") {
      deleteUser();
    }

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("nickName");
  };

  //? --------------------- 다음포스트  --------------------------

  useEffect(() => {
    // getReserved();
    // getConfirm();
    if (!sessionStorage.getItem("accessToken")) {
      setAlert(true);
      setContent("로그인이 필요한 페이지입니다!");
      // window.location.replace("/");
      setAddress("/");
    }
  }, []);

  console.log(user?.nickName === initialUser?.nickName);

  const editHandler = () => {
    if (user.nickName === initialUser.nickName || dupNickName) {
      sessionStorage.setItem("nickName", user.nickName);
      editUser();
      setOpenEdit(false);
    } else {
      setAlert(true);
      setContent("중복확인을 눌러주세요!");
    }
  };

  const closeHandler = () => {
    setOpenEdit(!openEdit);
    setUser(initialUser);
  };

  if (isLoading) {
    return (
      <>
        {alert && (
          <AlertModal
            setAlert={setAlert}
            content={content}
            confirm
            confirmAddress={"/"}
            confirmContent={"로그인"}
            cancelContent={"취소"}
            cancelAddress={-1}
          />
        )}
        <Loading />
      </>
    );
  } else {
    return (
      <Wrapper>
        {alert && (
          <AlertModal
            confirmFunction={confirmFunction}
            setConfirmAlert={setConfirmAlert}
            setAlert={setAlert}
            address={address}
            confirm
            confirmAddress={confirmAdress}
            confirmContent={confirmContent}
            cancelContent={cancelContent}
            cancelAddress={cancelAddress}
            content={content}
          />
        )}
        <MainHeader>
          {openEdit ? (
            <AiOutlineClose
              size={"24"}
              onClick={closeHandler}
              className="closeBtn"
            />
          ) : (
            <div className="gap" />
          )}
          <div className="headtxt">마이페이지</div>
          <RowBox>
            <div onClick={openEdit ? editHandler : () => setOpenEdit(true)}>
              {openEdit ? "완료" : "편집"}
            </div>
          </RowBox>
        </MainHeader>
        <AvatarBox userSelect={user?.userAvatar} />
        <ProfileCtn>
          {" "}
          <ProfileRow className="Topbox">
            {" "}
            <div>{user?.nickName} 님</div>{" "}
          </ProfileRow>
          {user?.visible == "V" && (
            <ProfileRow>
              <div>{user?.age ? `${user?.age} 살` : "없음"} /</div>
              <div>{user?.gender ? `${user?.gender}` : "없음"} /</div>
              <div>
                {" "}
                {user?.myPlace.length
                  ? `${user?.myPlace[0]} ${user?.myPlace[1]}`
                  : "없음"}
              </div>
            </ProfileRow>
          )}
          {user?.visible == "H" && <div>비공개</div>}
          <LikeGameCtn>
            <LikeGameBox>
              {likeGame?.map((game) => {
                if (likeGame.length >= 2) return <LikeGame>{game}</LikeGame>;
              })}
            </LikeGameBox>
          </LikeGameCtn>
          <MyPartyCtn>
            <MyPartyTitle onClick={() => SetisOpen(!isOpen)}>
              내가 찜한 모임
              <Arrow className={isOpen ? "open" : null} />
            </MyPartyTitle>
            {isOpen && (
              <MyPartyBox>
                {bookmark?.length === 0 && (
                  <div className="fontweight">비어있습니다.</div>
                )}
                {bookmark?.map((party) => {
                  return (
                    <MyPartyItem
                      setModalOpen={setModalOpen}
                      ModalOpen={ModalOpen}
                      party={party}
                      title={party.title}
                      postId={party.postId}
                    />
                  );
                })}
              </MyPartyBox>
            )}
            <MyPartyTitle onClick={() => SetisOpen1(!isOpen1)}>
              참여 신청 중인 모임
              <Arrow className={isOpen1 ? "open" : null} />
            </MyPartyTitle>
            {isOpen1 && (
              <MyPartyBox>
                {reservedParty?.length === 0 && (
                  <div className="fontweight">비어있습니다.</div>
                )}
                {reservedParty?.map((party) => {
                  return (
                    <MyPartyItem
                      setModalOpen={setModalOpen}
                      ModalOpen={ModalOpen}
                      party={party}
                      title={party.title}
                      postId={party._id}
                    />
                  );
                })}
              </MyPartyBox>
            )}
            <MyPartyTitle onClick={() => SetisOpen2(!isOpen2)}>
              참여 확정 모임
              <Arrow className={isOpen2 ? "open" : null} />
            </MyPartyTitle>
            {isOpen2 && (
              <MyPartyBox>
                {confirmParty?.length === 0 && (
                  <div className="fontweight">비어있습니다.</div>
                )}
                {confirmParty?.map((party) => {
                  return (
                    <MyPartyItem
                      setModalOpen={setModalOpen}
                      ModalOpen={ModalOpen}
                      party={party}
                      title={party.title}
                      postId={party._id}
                    />
                  );
                })}
              </MyPartyBox>
            )}{" "}
          </MyPartyCtn>{" "}
          <BottomTxt>
            <div className="txtbox" onClick={() => logoutHandler()}>
              로그아웃
            </div>
            <div className="txtbox" onClick={() => deletUserHandler()}>
              회원탈퇴
            </div>
            <div
              className="txtbox-noborder"
              onClick={() =>
                window.open("https://forms.gle/83os3kHzPNmC22fTA", "_blank")
              }
            >
              고객문의
            </div>{" "}
          </BottomTxt>
        </ProfileCtn>{" "}
        <EditUser
          initialUser={initialUser}
          setDupNickName={setDupNickName}
          user={user}
          onChange={onChange}
          setUser={setUser}
          openEdit={openEdit}
          setOpenEdit={setOpenEdit}
        />
      </Wrapper>
    );
  }
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--white);
  overflow-y: hidden;
`;

const MainHeader = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  background-color: var(--black);
  box-shadow: 0px 0.5px 15px 0.1px black;
  z-index: 100;
  color: white;
  padding: 3.5% 4% 3.5% 3%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .headtxt {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 7px #d90368, 0 0 10px #d90368, 0 0 21px #fff,
      0 0 42px #d90368, 0 0 82px #d90368, 0 0 92px #d90368, 0 0 102px #d90368,
      0 0 151px #d90368;
  }
  .closeBtn {
    :hover {
      cursor: pointer;
    }
    margin-left: 2%;
  }
  .gap {
    width: 30px;
    margin-left: 2%;
  }
`;

const RowBox = styled.div`
  display: flex;
  :hover {
    cursor: pointer;
  }
`;

const ProfileCtn = styled.div`
  z-index: 10;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--black);
  color: #d3d3d3;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  height: 56%;
  padding-top: 5%;
  padding-left: 10%;
  padding-bottom: 15%;
  padding: 5% 10% 15% 10%;
  overflow-y: hidden;
  overflow-y: scroll;
  //? -----모바일에서처럼 스크롤바 디자인---------------
  ::-webkit-scrollbar {
    width: 15px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #898989;
    //스크롤바에 마진준것처럼 보이게
    background-clip: padding-box;
    border: 4px solid transparent;
    border-radius: 15px;
  }
`;

const ProfileRow = styled.div`
  margin-top: 2%;
  width: 100%;
  padding: 0px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  &.Topbox {
    justify-content: space-between;
  }
  .visible {
    justify-content: space-between;
    display: flex;
    align-items: center;
    margin-left: 3%;
  }
`;

const LikeGameCtn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
`;

const LikeGameBox = styled.div`
  display: flex;
  justify-content: left;
  gap: 15px;
`;

const LikeGame = styled.div`
  padding: 5px 15px;
  font-size: 14px;
  border-radius: 30px;
  background-color: var(--primary);
`;

const MyPartyCtn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 5%;
`;

const MyPartyTitle = styled.div`
  color: #dadada;
  display: flex;
  align-items: center;
  margin-top: 10%;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const MyPartyBox = styled.div`
  margin-top: 5%;
  display: flex;
  flex-direction: column;
  width: 90%;
  max-height: 50%;
  .fontweight {
    font-weight: 600;
  }
`;
const BottomTxt = styled.div`
  margin-top: 15%;
  color: #6c6c6c;
  font-size: 15px;
  font-weight: 600;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  @media only screen and (max-width: 400px) {
    font-size: 11px;
  }

  :hover {
    cursor: pointer;
  }
  .txtbox {
    padding: 0px 20px;
    border-right: 1px solid #6c6c6c;
    :hover {
      text-decoration: underline;
    }
  }
  .txtbox-noborder {
    padding: 0px 20px;
    :hover {
      text-decoration: underline;
    }
  }
`;

const Arrow = styled.div`
  display: inline-block;
  border: 7px solid transparent;
  border-top-color: var(--white);
  transform: rotate(90deg);
  margin-left: 5%;
  &.left {
    transform: rotate(270deg);
  }
  &.open {
    margin-top: 7px;
    transform: rotate(0deg);
  }
  &.head {
    margin-left: 0;
    border-top-color: white;
  }
`;

export default MyPage;
