import 'azure-devops-ui/Core/override.css';
import 'es6-promise/auto';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './styles/Global.scss';
import store from './redux/store';
import { Provider } from 'react-redux';

export function showRootComponent(component: React.ReactElement<any>) {
  ReactDOM.render(<Provider store={store}>{component}</Provider>, document.getElementById('root'));
}
