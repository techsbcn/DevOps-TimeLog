import React, { useEffect } from 'react';
import * as SDK from "azure-devops-extension-sdk";
import { showRootComponent } from "../../Common";
//import { _VALUES } from '../../resources';

export const TimelogSummary: React.FC = () => {
    useEffect(() => {
        SDK.init().then(async () => {
            SDK.register(SDK.getContributionId(), () => {})
        })
    }, [])

    return (
        <div>Yewee</div>
    );
}
showRootComponent(<TimelogSummary />);
