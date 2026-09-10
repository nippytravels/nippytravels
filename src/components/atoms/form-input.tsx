"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import { Combobox } from "@base-ui/react/combobox";
import { Input } from "@base-ui/react/input";
import { Popover } from "@base-ui/react/popover";
import {
  AddCircle,
  CalendarMinimalistic,
  CloseCircle,
  Eye,
  EyeClosed,
  TrashBinMinimalistic,
} from "@solar-icons/react/ssr";
import { format } from "date-fns";
import { useState } from "react";
import {
  type Control,
  Controller,
  type ControllerRenderProps,
  type FieldArrayPath,
  type FieldValues,
  type Path,
  useController,
  useFieldArray,
} from "react-hook-form";
import DateWheelPicker from "./date-picker";
import { CaretDownIcon, CheckIcon } from "./icons";
import Switch from "./switch";

type SelectOption = {
  name: string;
  value: string;
};

type ArrayItemField = {
  name: string;
  label: string;
  type?: Exclude<FormInputProps<FieldValues>["type"], "array">;
  placeholder?: string;
  options?: SelectOption[];
  dateFormat?: string;
  multiple?: boolean;
};

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?:
    | "text"
    | "password"
    | "long"
    | "phone"
    | "select"
    | "date"
    | "number"
    | "array"
    | "boolean";
  placeholder?: string;
  disabled?: boolean;
  options?: SelectOption[];
  dateFormat?: string;
  multiple?: boolean;
  itemFields?: ArrayItemField[];
};

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  options,
  dateFormat,
  multiple,
  itemFields,
}: FormInputProps<T>) {
  if (type === "array") {
    if (!itemFields) {
      throw new Error(
        `FormInput: "itemFields" is required when type="array" (field "${name}")`,
      );
    }
    return (
      <ArrayInput
        control={control}
        name={name as FieldArrayPath<T>}
        label={label}
        itemFields={itemFields}
        disabled={disabled}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col w-full gap-1">
          <div className="w-full flex items-center justify-between gap-1">
            <label htmlFor={name} className="formLabel">
              {label}
            </label>
            {fieldState?.error && (
              <span className="formError">{fieldState.error.message}</span>
            )}
          </div>
          <Switch value={type}>
            {{
              password: () => (
                <PasswordInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              ),
              text: () => (
                <TextInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              ),
              long: () => (
                <LongInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              ),
              select: () =>
                typeof options !== "undefined" && (
                  <SelectInput
                    field={field}
                    disabled={disabled}
                    placeholder={placeholder}
                    options={options}
                    multiple={multiple}
                  />
                ),
              date: () => (
                <DateInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                  options={options}
                  dateFormat={dateFormat || "PPP"}
                />
              ),
              number: () => (
                <NumberInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              ),
              boolean: () => (
                <BooleanInput
                  field={field}
                  disabled={disabled}
                  placeholder={placeholder}
                />
              ),
            }}
          </Switch>
        </div>
      )}
    />
  );
}

type InputProps<T extends FieldValues> = Omit<
  FormInputProps<T>,
  "type" | "control" | "label" | "name"
> & {
  field: ControllerRenderProps<T, Path<T>>;
};

function BooleanInput<T extends FieldValues>({
  field,
  disabled,
}: InputProps<T>) {
  return (
    <Checkbox.Root
      name={field.name}
      disabled={disabled}
      onCheckedChange={(v) => field.onChange(v)}
      defaultChecked
      className="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-300 bg-neutral-300 text-neutral-500 data-checked:bg-neutral-300 data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
    >
      <Checkbox.Indicator className="flex data-unchecked:hidden">
        <CheckIcon />
      </Checkbox.Indicator>{" "}
    </Checkbox.Root>
  );
}

function DateInput<T extends FieldValues>({
  field,
  disabled,
  placeholder,
  dateFormat,
}: InputProps<T> & {
  dateFormat: string;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        id={field.name}
        disabled={disabled}
        data-empty={!field.value}
        className="w-full border border-solid border-neutral-200 text-neutral-500 rounded-sm text-sm py-2 px-2 bg-neutral-100 flex items-center justify-start gap-2"
      >
        <CalendarMinimalistic size={12} weight="Bold" />
        <span>
          {field.value
            ? format(field.value as Date, dateFormat)
            : (placeholder ?? "Pick a date")}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start">
          <Popover.Popup className="relative flex h-(--popup-height,auto) w-(--popup-width,auto) max-w-125 flex-col gap-1 origin-(--transform-origin) bg-transparent outline-none shadow-[0.25rem_0.25rem_0] p-3 shadow-black/12 dark:shadow-none transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            {/* <DayPicker
              mode="single"
              selected={field.value as Date | undefined}
              onSelect={(date) => {
                field.onChange(date?.toString());
              }}
              disabled={disabled}
              autoFocus
              classNames={{
                chevron: `${defaultClassNames.chevron} fill-black`,
                today: `border-neutral-200 bg-black/5 text-neutral-950 rounded-full`,
                selected: "bg-black text-white rounded-full",
                day: `text-neutral-950 font-regular`,
                month: `text-black font-medium`,
                button_next: "fill-black",
              }}
            /> */}
            <DateWheelPicker
              onChange={(value) => field.onChange(value.toString())}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PasswordInput<T extends FieldValues>({
  field,
  disabled,
  placeholder,
}: InputProps<T>) {
  const [isVisible, setVisible] = useState(false);

  return (
    <div className="input">
      <div className="flex">
        <Input
          render={
            <input
              id={field.name}
              name={field.name}
              type={isVisible ? "text" : "password"}
              ref={field.ref}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              placeholder={placeholder}
            />
          }
        />
        <button
          className="flex items-center justify-center px-1 rounded-sm"
          type="button"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
        >
          {isVisible ? <EyeClosed weight="Bold" /> : <Eye weight="Bold" />}
        </button>
      </div>
    </div>
  );
}

function NumberInput<T extends FieldValues>({
  field,
  disabled,
  placeholder,
}: InputProps<T>) {
  return (
    <Input
      render={
        <input
          id={field.name}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="input"
          type="number"
        />
      }
    />
  );
}

function TextInput<T extends FieldValues>({
  field,
  disabled,
  placeholder,
}: InputProps<T>) {
  return (
    <Input
      render={
        <input
          id={field.name}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="input"
        />
      }
    />
  );
}

function LongInput<T extends FieldValues>({
  field,
  disabled,
  placeholder,
}: InputProps<T>) {
  return (
    <Input
      render={
        <textarea
          id={field.name}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="input h-72 max-h-72"
        />
      }
    />
  );
}

function SelectInput<T extends FieldValues>({
  field,
  disabled,
  options,
  multiple,
}: InputProps<T> & {
  options: SelectOption[];
}) {
  return (
    <Combobox.Root
      disabled={disabled}
      value={
        Array.isArray(field.value)
          ? field.value.join(",")
          : (field.value as string)
      }
      onValueChange={field.onChange}
      multiple={multiple}
    >
      <Combobox.InputGroup className="relative h-8 w-full border border-solid border-neutral-200 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-neutral-950 dark:focus-within:outline-white dark:border-white [&>input]:pr-10 has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+2rem*2)]">
        <Combobox.Input
          placeholder={`eg ${options[0].value}`}
          id={field.name}
          name={field.name}
          className="h-full w-full bg-neutral-100 border border-solid border-neutral-200 rounded-sm p-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-500 outline-none placeholder:text-neutral-400"
        />
        <div className="absolute right-0 bottom-0 flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400">
          <Combobox.Clear
            className="combobox-clear flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-400"
            aria-label="Clear selection"
          >
            <CloseCircle weight="Bold" />
          </Combobox.Clear>
          <Combobox.Trigger
            className="flex h-full w-6 items-center justify-center border-0 bg-transparent p-0 text-neutral-400"
            aria-label="Open popup"
          >
            <CaretDownIcon />
          </Combobox.Trigger>
        </div>{" "}
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner
          className="outline-hidden select-none z-40"
          sideOffset={5}
        >
          <Combobox.Popup className="group min-w-(--anchor-width) origin-(--transform-origin) bg-clip-padding border border-neutral-200 bg-white rounded-md text-neutral-950 outline-hidden shadow transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:translate-y-px data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none">
            <Combobox.Empty>
              <div className="py-4 pr-4 pl-2 text-sm leading-4 text-neutral-400">
                No {field.name.split(".")[1].toUpperCase()} found
              </div>
            </Combobox.Empty>
            <Combobox.Arrow className="top-0 z-1 flex h-4 w-full cursor-default items-center justify-center bg-white text-center text-xs before:absolute data-[side=none]:before:-top-full before:left-0 before:h-full before:w-full before:content-['']" />
            <Combobox.List className="relative py-1 scroll-py-6 overflow-y-auto max-h-(--available-height)">
              {options.map((option) => (
                <Combobox.Item
                  value={option.value}
                  key={option.value}
                  className="menu-item"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon height={10} width={10} />
                  </Combobox.ItemIndicator>
                  <span className="col-start-2 font-medium">{option.name}</span>
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

type ArrayInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldArrayPath<T>;
  label: string;
  itemFields: ArrayItemField[];
  disabled?: boolean;
};

function ArrayInput<T extends FieldValues>({
  control,
  name,
  label,
  itemFields,
  disabled,
}: ArrayInputProps<T>) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const { fieldState } = useController({ control, name: name as Path<T> });

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="w-full flex items-center justify-between">
        <span className="formLabel">{label}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => append(buildDefaultItem(itemFields) as never)}
          className="bg-black p-1 rounded-full text-white"
        >
          <AddCircle weight="Bold" size={14} />
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-neutral-400">No items yet.</p>
      )}
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-2 rounded-sm border border-solid border-neutral-200 p-2"
          >
            {itemFields.map((itemField) => (
              <FormInput
                key={itemField.name}
                control={control}
                name={`${name}.${index}.${itemField.name}` as Path<T>}
                label={itemField.label}
                type={itemField.type}
                placeholder={itemField.placeholder}
                options={itemField.options}
                dateFormat={itemField.dateFormat}
                multiple={itemField.multiple}
                disabled={disabled}
              />
            ))}
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(index)}
              className="flex items-center justify-center rounded-sm hover:bg-red-200"
            >
              <TrashBinMinimalistic size={12} />
            </button>
          </div>
        ))}
      </div>
      {fieldState.error?.message && (
        <span className="formError">{fieldState.error.message}</span>
      )}
    </div>
  );
}

function buildDefaultItem(
  itemFields: ArrayItemField[],
): Record<string, unknown> {
  return itemFields.reduce<Record<string, unknown>>((acc, f) => {
    if (f.type === "date") acc[f.name] = undefined;
    else if (f.type === "select") acc[f.name] = f.multiple ? [] : null;
    else if (f.type === "number") acc[f.name] = undefined;
    else acc[f.name] = "";
    return acc;
  }, {});
}
