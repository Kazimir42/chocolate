'use client'
import {useEffect, useState} from "react";
import Link from "next/link";

export default function Home() {
    const [steps, setSteps] = useState([]);
    const [cyclesNumber, setCyclesNumber] = useState(0);

    useEffect(() => {
        let localSteps = JSON.parse(localStorage.getItem('steps'));
        setSteps(localSteps ? localSteps : []);
        setCyclesNumber(parseInt(localStorage.getItem('cycles_number') ?? 0));
    }, []);

    function updateCyclesNumber(value) {
        setCyclesNumber(value || 0);
        localStorage.setItem('cycles_number', value || 0);
    }

    function addNewStep() {
        const newStep = {
            id: steps.length > 0 ? steps[steps.length - 1].id + 1 : 1,
            name: 'new step',
            duration: 30,
        };

        const updatedSteps = [...steps, newStep];

        setSteps(updatedSteps);
        localStorage.setItem('steps', JSON.stringify(updatedSteps));
    }

    function updateStep(id, field, value) {
        const updatedSteps = steps.map((step) => {
            if (step.id === id) {
                return {
                    ...step,
                    [field]: field === 'duration' && value === '' ? 0 : value,
                };
            }
            return step;
        });

        setSteps(updatedSteps);
        localStorage.setItem('steps', JSON.stringify(updatedSteps));
    }

    function deleteStep(id) {
        const updatedSteps = steps.filter(step => step.id !== id);
        setSteps(updatedSteps);
        localStorage.setItem('steps', JSON.stringify(updatedSteps));
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-blue-400 p-4 gap-8">
            <Link className={'absolute font-bold text-xl left-2 top-2'} href={'/'}
                  onClick={(e) => e.stopPropagation()}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                    <path
                        d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"/>
                    <path
                        d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"/>
                </svg>
            </Link>
            <div>
                <h2 className={'font-bold text-4xl pb-4'}>Configuration</h2>
                <div>
                    <label className={'text-lg font-semibold'} htmlFor={'inputCycleNumber'}>Number of cycles : </label>
                    <input className={'bg-transparent border border-white rounded-md p-2 text-lg'} type={'number'}
                           id={'inputCycleNumber'} min={1} max={99} value={cyclesNumber}
                           onChange={(e) => updateCyclesNumber(parseInt(e.target.value) || 0)}/>
                </div>
            </div>
            <div>
                <h2 className={'font-bold text-4xl pb-4 text-center'}>Steps</h2>
                <div className={'flex flex-col gap-2'}>
                    {steps.map((step) => (
                        <div key={step.id} className={'bg-blue-500 rounded-md p-2 flex flex-col gap-1'}>
                            <div>
                                <label className={'text-lg font-semibold'}>Name: </label>
                                <input
                                    className={'bg-transparent border border-white rounded-md p-2 text-lg'}
                                    type={'text'}
                                    value={step.name}
                                    onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={'text-lg font-semibold'}>Duration: </label>
                                <input
                                    className={'bg-transparent border border-white rounded-md p-2 text-lg'}
                                    type={'number'}
                                    min={1}
                                    max={999}
                                    value={step.duration}
                                    onChange={(e) => updateStep(step.id, 'duration', e.target.value === '' ? '' : parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <button className={'bg-red-600 px-4 py-2 rounded-md mt-2'}
                                        onClick={() => deleteStep(step.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                         className="size-6">
                                        <path fillRule="evenodd"
                                              d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                                              clipRule="evenodd"/>
                                    </svg>

                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={'mt-4'}>
                    <button className={'bg-blue-600 px-4 py-2 rounded-md'} onClick={addNewStep}>
                        + New step
                    </button>
                </div>
            </div>
        </main>
    );
}
