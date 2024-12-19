import React from 'react';
import "./footer_button.css";
import ButtonLoader from "components/loaders/buttonloader/Buttonloader"; 

const FooterButton = ({
  title,
  loading,
  onClick,
  name,
  icon,
  className,
  disabled,
  type,
  iconAfterText,
  btnloadercss,
}) => {
  return (
    <button
      className={`footer-button ${disabled && "footer-button-disabled"} ${
        iconAfterText && "button_iconAfterText"
      } ${className || ""} `}
      name={name || ""}
      onClick={onClick}
      disabled={disabled || loading}
      type={type || "button"}
      translate="yes"
    >
      {loading ? (
        <ButtonLoader btnloadercss={btnloadercss} />
      ) : (
        <>
          <span> {icon || null}</span> <span> {title || "Button"}</span>{" "}
          {iconAfterText || null}
        </>
      )}
    </button>
  );
};

export default FooterButton;
