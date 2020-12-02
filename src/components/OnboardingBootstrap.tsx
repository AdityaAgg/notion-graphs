import React from "react";
import { useContext } from "react";
import { ShepherdTour, ShepherdTourContext } from "react-shepherd";
import { onboardingOptions, onboardingSteps } from "../lib/onboardingObjects";
import "shepherd.js/dist/css/shepherd.css";

const OnboardingBootstrap: React.FC = () => {
    return (
        <ShepherdTour steps={onboardingSteps} tourOptions={onboardingOptions}>
            <OnboardingBootstrapInner />
        </ShepherdTour>);
}

const OnboardingBootstrapInner: React.FC = () => {
    const tour = useContext(ShepherdTourContext);
    if (localStorage.getItem("onboarding") !== "true") {
        localStorage.setItem("onboarding", "true");
        tour?.start();
    }
    return (
        <> </>
    );
};

export default OnboardingBootstrap;
