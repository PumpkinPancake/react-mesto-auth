import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import "../App.css";
import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from "../context/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import api from "../utils/Api";
import Card from "./Card";

import "../index.css";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import { Register } from "./Register";
import { Login } from "./Login";
import { InfoToolTip } from "./InfoToolTip";
import { PopupWithWarning } from "./PopupWithWarning";
import { ProtectedRoute } from './ProtectedRoute';
import * as auth from "../utils/auth";

import Cross from "../Cross.svg";
import CheckMark from "../Check_mark.svg";

const ProtectedComponent = ({
  cards,
  handleEditAvatarClick,
  handleEditProfileClick,
  handleAddPlaceClick,
  handleCardClick,
  handleCardLike,
  handleCardDelete,
}) => {
  return (
    <>
      <Header />

      <Main
        onEditAvatar={handleEditAvatarClick}
        onEditProfile={handleEditProfileClick}
        onAddPlace={handleAddPlaceClick}
      />

      <section className="elements">
        {cards.map((card) => {
          return (
            <Card
              card={card}
              key={card._id}
              link={card.link}
              name={card.name}
              likes={card.likes}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
            ></Card>
          );
        })}
      </section>
    </>
  );
};

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [emailValue, setEmailValue] = useState(null);
  const [isCheckStatusPopup, setIsCheckStatusPopup] = useState(false);
  const [imageCheckStatus, setImageCheckStatus] = useState("");
  const [titleCheckStatus, setTitleCheckStatus] = useState("");

  const navigate = useNavigate();

  const handleLogin = (email, password) => {
    auth
      .authorization(email, password)
      .then((res) => {
        localStorage.setItem("jwt", res.token);
        setLoggedIn(true);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const logout = () => {
    setLoggedIn(false);
    setEmailValue(null);
    localStorage.removeItem("jwt");
    navigate("/sign-in");
  };

  const tokenCheck = () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      return;
    }
    auth.getContent(jwt).then((res) => {
      if (res) {
        handleLogin(res.email, res.password);
        navigate("/");
      }
    });
  };

  useEffect(() => {
    tokenCheck();
  }, []);

  const handleRegister = (email, password) => {
    auth
      .register(email, password)
      .then(() => {
        setImageCheckStatus(CheckMark);
        setTitleCheckStatus("Вы успешно зарегистрировались!");
        setLoggedIn(true);
        navigate("/sign-in");
      })
      .catch((err) => {
        setImageCheckStatus(Cross);
        setTitleCheckStatus("Что-то пошло не так! Попробуйте ещё раз.");
        console.log(err);
      });
  };

  useEffect(() => {
    api
      .getUserInfo()
      .then((userInfo) => {
        setCurrentUser(userInfo);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    api
      .getInitialCards()
      .then((data) => {
        setCards(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleChangeUserInfo(name, about) {
    api
      .setUserInfo(name, about)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleChangeUserAvatar(newLink) {
    api
      .installAvatar(newLink.avatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardLike(card, cardId) {
    const isLiked =
      card.likes.findIndex((item) => item._id === currentUser._id) !== -1;
    if (!isLiked) {
      api
        .likeCard(cardId)
        .then((res) => {
          const newCards = cards.map((c) => (c._id === card._id ? res : c));
          setCards(newCards);
        })
        .catch((err) => console.log(err));
    } else {
      api
        .likeRemove(cardId)
        .then((res) => {
          const newCards = cards.map((c) => (c._id === card._id ? res : c));
          setCards(newCards);
        })
        .catch((err) => console.log(err));
    }
  }

  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((prevCards) => {
          return prevCards.filter((c) => c._id !== card._id);
        });
      })
      .catch((err) => console.log(err));
  }

  function addNewPlace(cardElement) {
    api
      .getPlaceCard(cardElement)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsImagePopupOpen(false);
    setSelectedCard(null);
    setIsCheckStatusPopup(false);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Routes>
        <Route
          path="/sign-in"
          element={
            <>
              <Header title="Регистрация" route="/sign-up" />
              <Login handleLogin={handleLogin} />
            </>
          }
        />

        <Route
          path="/sign-up"
          element={
            <>
              <Header title="Войти" route="/sign-in" />
              <Register handleRegister={handleRegister} />
            </>
          }
        />

        <Route
          path="/"
          element={
            <>
              <Header
                email={emailValue}
                title="Выйти"
                route="/"
                onClick={logout}
              />

              <ProtectedRoute
                component={ProtectedComponent}
                loggedIn={loggedIn}
                cards={cards}
                handleEditAvatarClick={handleEditAvatarClick}
                handleEditProfileClick={handleEditProfileClick}
                handleAddPlaceClick={handleAddPlaceClick}
                handleCardClick={handleCardClick}
                handleCardLike={handleCardLike}
                handleCardDelete={handleCardDelete}
              />
            </>
          }
        ></Route>

        <Route
          path="*"
          element={
            loggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/sign-up" replace />
            )
          }
        />
      </Routes>

      <EditProfilePopup
        onClose={closeAllPopups}
        isOpen={isEditProfilePopupOpen}
        onUpdateUser={handleChangeUserInfo}
      ></EditProfilePopup>

      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        handleClick={handleAddPlaceClick}
        addNewCard={addNewPlace}
      ></AddPlacePopup>

      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        handleClick={handleEditAvatarClick}
        onUpdateAvatar={handleChangeUserAvatar}
      />

      <PopupWithForm
        submitButtonText="Да"
        title="Вы уверены?"
        name="warning"
      ></PopupWithForm>

      <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      <InfoToolTip onClose={closeAllPopups} img={isCheckStatusPopup} />
      <Footer />
    </CurrentUserContext.Provider>
  );
}

export default App;
