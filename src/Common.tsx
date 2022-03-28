import "azure-devops-ui/Core/override.css";
import "es6-promise/auto";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "./Common.scss";
//import './i18n';
//import { I18nextProvider } from 'react-i18next';

export function showRootComponent(component: React.ReactElement<any>) {
    ReactDOM.render(component, document.getElementById("root"));
}