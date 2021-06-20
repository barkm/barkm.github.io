import { Subscribable } from "./subscribable";

export interface ColorParameters {
  background: string;
  icon: string;
}

export interface DayNightParameters {
  day: ColorParameters;
  night: ColorParameters;
}

export function addDayNightToggle(
  isDay: Subscribable<boolean>,
  parameters: DayNightParameters
) {
  const colorParameters = isDay ? parameters.day : parameters.night;
  const dayNightButton = document.querySelector(
    ".day-night-button"
  )! as HTMLElement;
  dayNightButton.style.background = colorParameters.background;
  const iconElement = document.createElement("i");
  const icon = isDay ? "fa-moon" : "fa-sun";
  iconElement.classList.add("fas", icon, "icon");
  iconElement.style.color = colorParameters.icon;
  dayNightButton.appendChild(iconElement);
}
