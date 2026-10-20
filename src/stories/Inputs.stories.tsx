import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox, Switch } from "../components/inputs/Checkbox.tsx";
import { FileDropInput, FileInput } from "../components/inputs/FileInput.tsx";
import { Input } from "../components/inputs/Input.tsx";
import { RadioGroup } from "../components/inputs/RadioGroup.tsx";
import { Select } from "../components/inputs/Select.tsx";
import { TextArea } from "../components/inputs/TextArea.tsx";

interface Values {
  name: string;
  password: string;
  birthday: string;
  color: string;
  plan: string;
  bio: string;
  avatar: FileList;
  documents: FileList;
  newsletter: boolean;
  terms: boolean;
}

const InputsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { plan: "free" } });
  const [result, setResult] = useState<string>();
  const [rejected, setRejected] = useState<string>();
  const required = { required: "This field is required" };

  const onSubmit = (values: Values) =>
    setResult(
      JSON.stringify(
        {
          ...values,
          avatar: Array.from(values.avatar, (file) => file.name),
          documents: Array.from(values.documents, (file) => file.name),
        },
        null,
        2
      )
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-96 flex-col gap-4">
      <Input
        label="Name"
        description="As it appears on your ID"
        error={errors.name?.message}
        end={
          <button type="button" className="rounded-r bg-ui-border/50 px-2 shadow">
            Check
          </button>
        }
        {...register("name", required)}
      />
      <Input label="Password" type="password" error={errors.password?.message} {...register("password", required)} />
      <Input label="Birthday" type="date" error={errors.birthday?.message} {...register("birthday", required)} />
      <Select
        label="Color"
        placeholder="Pick a color"
        options={[
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ]}
        error={errors.color?.message}
        {...register("color", required)}
      />
      <RadioGroup
        label="Plan"
        horizontal
        options={[
          { label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
          { label: "Team", value: "team", disabled: true },
        ]}
        {...register("plan")}
      />
      <TextArea label="Bio" error={errors.bio?.message} {...register("bio", required)} />
      <FileInput
        label="Avatar"
        placeholder="Choose an image"
        accept="image/*"
        error={errors.avatar?.message}
        {...register("avatar", { validate: (files) => files.length > 0 || "Pick an image" })}
      />
      <FileDropInput
        label="Documents"
        description="Up to 1 MB each"
        placeholder="Drop files or click here"
        multiple
        maxSize={1024 ** 2}
        onReject={(files) => setRejected(`Too big: ${files.map((file) => file.name).join(", ")}`)}
        error={errors.documents?.message ?? rejected}
        {...register("documents", { validate: (files) => files.length > 0 || "Add a document" })}
      />
      <Switch label="Send me the newsletter" {...register("newsletter")} />
      <Checkbox
        label="I accept the terms"
        error={errors.terms?.message}
        {...register("terms", { required: "You have to accept the terms" })}
      />
      <div className="flex gap-2">
        <button className="flex-1 rounded bg-ui-accent px-3 py-1 text-white hover:opacity-90">Submit</button>
        <button type="reset" onClick={() => setRejected(undefined)} className="flex-1 rounded bg-ui-border/50 px-3 py-1">
          Reset
        </button>
      </div>
      {result && <pre className="text-xs">{result}</pre>}
    </form>
  );
};

const meta: Meta<typeof InputsForm> = {
  title: "Inputs",
  component: InputsForm,
};

export default meta;

export const WithReactHookForm: StoryObj<typeof InputsForm> = {};
