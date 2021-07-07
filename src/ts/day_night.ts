import { Subscribable } from "./subscribable";

export function addDayNightToggle(isDay: Subscribable<boolean>) {
  const middle = document.querySelector(".middle")! as HTMLElement;
  middle.addEventListener("click", (e: MouseEvent) => {
    isDay.value = !isDay.value;
    isDay.callSubscribers();
  });
}
