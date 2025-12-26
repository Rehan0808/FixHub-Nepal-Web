type InputProps = {
  label: string;
  type?: string;
  error?: string;
  register?: any;
};

export default function Input({ label, type = "text", error, register }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        {...register}
        className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
