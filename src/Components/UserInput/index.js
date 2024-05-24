import axios from "axios";
import React, { useEffect, useState } from "react";

export default function UserInput() {
  const [inputText, setInputText] = useState(null);
  const [inputPromptText, setInputPromptText] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [showInputPrompt, setShowInputPrompt] = useState(false);
  const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
  const [inputPromptResponse, setInputPromptResponse] = useState(null);
  const [promptOption, setPromptOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOptionSelect = (option = promptOption) => {
    const payload = {
      prompts: [
        {
          content: {
            type: "answer",
            reply: inputText + '' + inputPromptText + '/' + option,
            context: ''
          },
          role: "user"
        }
      ]
    };

    const headers = {
      headers: {
        "Authorization": 'hiouegiyeriugerhiowehioekber',
        "Content-Type": 'application/json',
      }
    }

    setPromptOption(option);
    setIsLoading(true);

    axios.post('https://gpt-mj-bridge.mugafi.com/API/tools/ved/story', payload, headers)
      .then(res => {
        const formattedResponse = JSON.parse(res.data.response);
        setInputPromptResponse(formattedResponse);
        console.log(formattedResponse, 'formattedResponse')
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        setInputPromptResponse({})
      })
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          setSelectedOption((prev) => (prev === 0 ? 2 : prev - 1));
          break;
        case 'ArrowDown':
          setSelectedOption((prev) => (prev === 2 ? 0 : prev + 1));
          break;
        case 'Enter':
          if(showInputPrompt) {
            event.preventDefault()
            handleOptionClick(selectedOption);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOption, handleOptionSelect]);

  useEffect((e) => {
    const countWords = (text) => {
      return text ? text.trim().split(' ').length : 0;
    };

    setWordCount(countWords(inputText));
    setCharacterCount(inputText ? inputText.length : 0);
    setInputPromptResponse(null);
    setInputPromptText(null);
    setPromptOption(null);
  }, [inputText]);

  const isValidData = val => {
    if (val !== null && val !== undefined && val !== "NA") {
      return true;
    } else {
      return false;
    }
  }

  const handleOptionClick = (index) => {
    const options = ['IMPROVE', 'SUGGEST NEXT', 'EXPAND'];
    handleOptionSelect(options[index]);
  };

  const handleTextChange = (e) => {
    setInputText(e.target.value);

    if (e.target.value.endsWith('/')) {
      const { top, left, height } = e.target.getBoundingClientRect();

      const lineHeight = 16; // Assuming a fixed line height, adjust if necessary
      const lines = e.target.value.split("\n").length;

      setBoxPosition({ top: top + (lineHeight * (lines-1)), left })

      setShowInputPrompt(true);
    } else {
      setShowInputPrompt(false);
    }
  };

  const handleInputPromptTextChange = (e) => {
    setInputPromptText(e.target.value);
  };
  
  const setPromptDataToBox = () => {
    setShowInputPrompt(false);
    setInputText(inputText + ' ' + inputPromptResponse?.payload?.[0]?.text);
    setInputPromptResponse(null);
    setInputPromptText(null);
    setPromptOption(null);
  }

  const setTryAgainState = () => {
    // setInputPromptText(null);
    setInputPromptResponse(null);
  }

  const setDiscardState = () => {
    setShowInputPrompt(false);
    setInputPromptResponse(null);
    setInputPromptText(null);
    setPromptOption(null);
  }

  function renderLoadingState() {
    return <div className="loadingState">Ved is writing...</div>
  }

  function renderPromptInputState() {
    return (
      <>
        <input 
          type="text" placeholder="Ask Ved Anything or choose an option below..." 
          className=""
          value={inputPromptText}
          onChange={handleInputPromptTextChange}
        />

        <div
          className={`optionsBox ${selectedOption === 0 ? 'selected' : ' '}`}
          onClick={() => handleOptionClick(0)}
        >
          Improve story idea
        </div>

        <div
          className={`optionsBox ${selectedOption === 1 ? 'selected' : ' '}`}
          onClick={() => handleOptionClick(1)}
        >
          Suggest what to write next
        </div>

        <div
          className={`optionsBox ${selectedOption === 2 ? 'selected' : ' '}`}
          onClick={() => handleOptionClick(2)}
        >
          Expand
        </div>
      </>
    )
  }

  function renderPromptBoxResponse() {
    const validResponse = inputPromptResponse?.payload?.[0]?.text ? true : false;

    return (
      <>
        <div>{validResponse ? inputPromptResponse.payload[0].text : inputPromptText || 'Oops! Please try again!'}</div>

        <hr color="pink" />

        <div className="display_flex justify_content_end grid_gap_8" >
          <div className="optionsBox" onClick={setTryAgainState}>Try Again</div>
          <div className="optionsBox" onClick={setDiscardState}>Discard</div>
        </div>

        {validResponse && <hr color="pink" />}

        {validResponse && (
          <div className="display_flex justify_content_start grid_gap_8">
            <div className="optionsBox" onClick={setPromptDataToBox}>Insert Below</div>
            <div className="optionsBox" onClick={setPromptDataToBox}>Replace Selection</div>
            <div className="optionsBox" onClick={setPromptDataToBox}>Save to Notes</div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="inputBoxWrapper">
      {/* initial input box to start writing  */}
      <div className="textareaWrapper">
        <textarea
          placeholder="Start writing your story..." rows='10' cols='50'
          value={inputText}
          onChange={handleTextChange}
        />

        {showInputPrompt ? (
          <div className="promptBox" style={{ top: boxPosition.top, left: boxPosition.left }}>
            {isLoading ? renderLoadingState() : isValidData(inputPromptResponse) ? renderPromptBoxResponse() : renderPromptInputState()}
          </div>
        ) : null}
      </div>

      <div className="countText padding_t_8">No. of characters: {characterCount}</div>
      <div className="countText">No. of words: {wordCount}</div>
    </div>
  );
}
