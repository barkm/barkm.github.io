import { Subscribable } from "./subscribable";

export interface ColorParameters {
  background: string;
  icon: string;
}

export interface DayNightParameters {
  day: ColorParameters;
  night: ColorParameters;
}

function addButton(
  isDay: boolean,
  colorParameters: ColorParameters
): HTMLElement {
  const dayNightButton = document.querySelector(
    ".day-night-button"
  )! as HTMLElement;
  dayNightButton.style.background = colorParameters.background;
  var iconElement = document.querySelector(".icon")! as HTMLElement;
  iconElement.setAttribute("class", "");
  const icon = isDay ? "fa-moon" : "fa-sun";
  iconElement.classList.add("fas", icon, "icon");
  iconElement.style.color = colorParameters.icon;
  dayNightButton.appendChild(iconElement);
  return dayNightButton;
}

export function addDayNightToggle(
  isDay: Subscribable<boolean>,
  parameters: DayNightParameters
) {
  const addButton_ = (d: boolean) =>
    addButton(d, d ? parameters.day : parameters.night);
  const button = addButton_(isDay.value);
  isDay.subscribeOnFinishChange(addButton_);
  button.addEventListener("click", () => {
    isDay.value = !isDay.value;
    isDay.callSubscribers();
  });
}
