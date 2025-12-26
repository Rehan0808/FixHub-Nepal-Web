type ButtonProps = {
  text: string;
};

export default function Button({ text }: ButtonProps) {
  return (
    <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-center">
      {text}
    </button>
  );
}
