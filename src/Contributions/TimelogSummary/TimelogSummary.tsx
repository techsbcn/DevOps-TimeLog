import React, { useEffect } from 'react';
import * as SDK from "azure-devops-extension-sdk";
import { showRootComponent } from "../../Common";

export const TimelogSummary: React.FC = () => {
    useEffect(() => {
        SDK.init().then(async () => {
            SDK.register(SDK.getContributionId(), () => {})
        })
    }, [])

    return (
        <div>TimelogSummary</div>
    );
}
showRootComponent(<TimelogSummary />);
