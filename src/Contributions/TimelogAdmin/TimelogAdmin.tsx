import React, { useEffect } from 'react';
import * as SDK from "azure-devops-extension-sdk";

export const TimelogAdmin: React.FC = () => {
    useEffect(() => {
        SDK.init().then(async () => {
            SDK.register(SDK.getContributionId(), () => {})
        })
    }, [])

    return (
        <div>TimelogAdmin</div>
    );
}