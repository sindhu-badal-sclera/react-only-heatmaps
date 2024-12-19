import React from 'react';
import React from "react";
import "./buttonloader.css";

const ButtonLoader = ({ btnloadercss }) => {
	return (
		<div className={`loader-container ${btnloadercss}`}>
			<div className="btnloader"></div>
		</div>
	);
};

export default ButtonLoader;
