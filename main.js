import { fromEvent, combineLatest } from "https://cdn.skypack.dev/rxjs";
import {
  debounceTime,
  filter,
  map,
  startWith,
} from "https://cdn.skypack.dev/rxjs/operators";
import _chunk from "https://cdn.skypack.dev/lodash.chunk";

let fromCsvTextArea = ($el) =>
  fromEvent($el, "input").pipe(
    debounceTime(300),
    map((e) =>
      e.target.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
    filter((v) => v.length > 0)
  );

let $mode = document.getElementById("mode");
let $result = document.getElementById("result");

combineLatest([
  fromCsvTextArea(document.getElementById("destinations")),
  fromCsvTextArea(document.getElementById("mods")),
  fromEvent($mode, "input").pipe(
    map((e) => e.target.value),
    startWith($mode.value)
  ),
])
  .pipe(
    map(([destinations, mods, mode]) =>
      destinations.flatMap((d) =>
        mods.flatMap((m) => {
          switch (mode) {
            case "dst-first":
              return `${d} ${m}`;
            case "mod-first":
              return `${m} ${d}`;
            default:
              return [`${d} ${m}`, `${m} ${d}`];
          }
        })
      )
    )
  )
  .subscribe((r) => ($result.value = r.join("\n")));

let toDataCsv = (values) =>
  encodeURI("data:text/csv;charset=utf-8," + values.join("\n"));

let download = (fileName, content) => {
  let link = document.createElement("a");
  link.setAttribute("href", content);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
};

let $fileName= document.getElementById("fileName");
let $itemsPerFile = document.getElementById("itemsPerFile");

document.getElementById("download").addEventListener("click", () => {
  _chunk($result.value.split("\n"), +$itemsPerFile.value).forEach((values, i) =>
    download(`${$fileName.value || 'keywords'}-${i}.csv`, toDataCsv(values))
  );
});
