import { FaArrowRight } from "react-icons/fa";

export default function Predict2026({ activatePredict, close }) {
    if (!activatePredict) return null;

    return <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/80 transition-all duration-50">

            <div className=" p-8 rounded-2xl shadow-xl w-[100%] h-[100%] ">
                <h2 className="text-2xl font-formula1bold mb-4">Add Data</h2>

                <div className="flex justify-end ">
                <button
                    onClick={close}
                    className=""
                >
                    <FaArrowRight className="text-white hover:text-gray-300 cursor-pointer text-[22px]" />
                </button>

                </div>

            </div>

        </div>
    </div>
}