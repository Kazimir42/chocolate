'use client'
import {useEffect, useState, useRef} from "react";
import Link from "next/link";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(null);
    const [nextStep, setNextStep] = useState(null);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [currentRound, setCurrentRound] = useState(1);
    const [isCounting, setIsCounting] = useState(false);
    const [timer, setTimer] = useState(0);
    const intervalRef = useRef(null); // Utilisation de useRef pour conserver l'intervalle

    useEffect(() => {
        defineCurrentAndNextStep()
    }, []);

    useEffect(() => {
        // Nettoyage lorsque le composant est démonté
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (currentStep) {
            setIsLoading(false)
        }
    }, [currentStep])

    useEffect(() => {
        // The round is finish
        if (timer === currentStep?.duration) {
            finishRound()
        }
    }, [timer])

    const steps = [
        {
            id: 1, name: 'Repos 1', duration: 5, in_progress: true,
        },
        {
            id: 2, name: 'Repos 2', duration: 3, in_progress: false,
        },
        /*
        {
            id: 3, name: 'Repos 3', duration: 4, in_progress: false,
        }
        */
    ]

    const cycles_number = '5';

    function defineCurrentAndNextStep() {
        let found = false;
        setNextStep(null)

        // Find in progress step
        steps.forEach((step, key) => {
            if (step.in_progress) {
                found = true;
                setCurrentStep(step);
                if (steps[key + 1]) {
                    setNextStep(steps[key + 1])
                }
            }
        })

        // No step in progress, set the first so
        if (!found) {
            steps[0].in_progress = true;
            setCurrentStep(steps[0])
            if (steps[1]) {
                setNextStep(steps[1])
            }
        }

        return currentStep;
    }

    function handleTimer() {
        if (!isCounting) {
            console.log('start timer');
            setIsCounting(true);
            intervalRef.current = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        } else {
            console.log('pause timer');
            setIsCounting(false);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    function resetTimer() {
        setIsCounting(false)
        setTimer(0)
        clearInterval(intervalRef.current);
    }

    function finishRound() {
        resetTimer();

        // There are next step, so its a new round
        if (nextStep) {
            steps.forEach((step, index) => {
                if (steps[index].id === nextStep.id) {
                    steps[index].in_progress = true;
                } else {
                    steps[index].in_progress = false;
                }
            })

            setCurrentRound(currentRound + 1)
            defineCurrentAndNextStep()

        }else {
            // There are no next step, si it a new cycle
            setCurrentRound(1)
            setCurrentCycle(currentCycle + 1)
            steps[0].in_progress = true;
            defineCurrentAndNextStep()
        }


    }

    return (
        <main className="flex min-h-screen flex-col items-center">
            {!isLoading ? (
                <>
                    <div className={'h-[70vh] bg-green-400 w-full pt-2 cursor-pointer'} onClick={() => handleTimer()}>
                        <Link className={'absolute font-bold text-xl left-2 top-2'} href={'/steps'}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                 className="size-8">
                                <path fillRule="evenodd"
                                      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                                      clipRule="evenodd"/>
                            </svg>
                        </Link>
                        {!isCounting ?
                            <p className={'mx-auto w-full text-center h-0 font-light text-lg '}>Press the green part
                                to start</p>
                            : null}
                        <div className={'w-28 right-0 top-2 absolute font-semibold text-lg'}>
                            <div className={'grid grid-cols-3'}>
                                <div className={'col-span-2'}>round :</div>
                                <div>{currentRound}/{steps.length}</div>
                            </div>
                            <div className={'grid grid-cols-3'}>
                                <div className={'col-span-2'}>cycle :</div>
                                <div>{currentCycle}/{cycles_number}</div>
                            </div>
                        </div>

                        <div className={' flex flex-col p-8 gap-8 justify-center h-full'}>
                            <h1 className={'text-center text-6xl font-bold'}>{currentStep?.name}</h1>
                            <p className={'text-center text-8xl font-bold'}>00:{currentStep?.duration - timer}</p>
                        </div>
                    </div>
                    <div className={'h-[30vh] bg-blue-400 w-full flex flex-col p-8 gap-4 justify-center'}>
                        {nextStep ?
                            (
                                <>
                                    <h1 className={'text-center text-4xl font-bold'}>{nextStep?.name}</h1>
                                    <p className={'text-center text-6xl font-bold'}>{'00:' + nextStep.duration}</p>
                                </>
                            ) : (
                                <h1 className={'text-center text-6xl font-bold'}>{'Fini :)'}</h1>
                            )
                        }
                    </div>
                </>
            ) : (
                <div className={'flex flex-col h-screen justify-center'}>
                    <h1 className={'text-center text-4xl font-bold'}>Loading...</h1>
                </div>
            )}
        </main>
    );
}
