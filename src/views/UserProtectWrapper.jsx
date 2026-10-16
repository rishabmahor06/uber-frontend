"use client";
import React from "react";
import PropTypes from "prop-types";
import AccountGate from "../components/AccountGate";

const UserProtectWrapper = ({ children }) => (
  <AccountGate role="user">{children}</AccountGate>
);

UserProtectWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserProtectWrapper;
