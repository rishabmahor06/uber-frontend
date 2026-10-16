"use client";
import React from "react";
import PropTypes from "prop-types";
import AccountGate from "../components/AccountGate";

const CaptainProtectWrapper = ({ children }) => (
  <AccountGate role="captain">{children}</AccountGate>
);

CaptainProtectWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CaptainProtectWrapper;
