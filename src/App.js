import React, { useState, useEffect } from 'react';
import './App.css';

function remove(arr, value) {
  return arr.filter(function (ele) { return ele !== value; });
}

function Option({ selected, label, value, onChange }) {
  return (
    <div
      className="OptionBar"
      onClick={() => {
        if (selected.indexOf(value) === -1) {
          onChange(selected.concat(value));
        } else {
          onChange(remove(selected, value));
        }
      }}
    >
      <span className="OptionCheckBack">
        {selected.indexOf(value) >= 0 && (
          <span className="OptionCheckmark" />
        )}
      </span>
      <span className="OptionLabel">{label}</span>
    </div>
  );
}

function logResults(selected, improve, impact, comments) {
  const xhr = new XMLHttpRequest()

  xhr.addEventListener('load', () => {
    console.log(xhr.responseText);
  })
  let send = '';
  for (let i = 0; i < selected.length; ++i) {
    if (send.length) { send += '&'; }
    const key = selected[i];
    send += `${key}=X`;
  }
  xhr.open('POST', 'https://script.google.com/macros/s/AKfycbxa64QC-IFGT6juCZ3odQp3B_OAUSCbgZvsMZ1y/exec');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send(`${send}&improvements=${encodeURI(improve)}&impact=${encodeURI(impact)}&comments=${encodeURI(comments)}`);
}

function useRemote(count) {
  const [data, updateData] = useState({});

  useEffect(() => {
    async function fetchData() {
      const xhr = new XMLHttpRequest()
      xhr.addEventListener('load', () => {
        const { headers, data } = JSON.parse(xhr.responseText);
        let mapped = {};

        for (let i = 0; i < data.length; ++i) {
          for (let j = 0; j < headers.length; ++j) {
            if (data[i][j] === 'X') {
              mapped[headers[j]] = mapped[headers[j]] ? mapped[headers[j]] + 1 : 1;
            }
          }
        }

        console.log("Data", mapped);
        updateData(mapped);
      })
      xhr.open('GET', 'https://script.google.com/macros/s/AKfycbxa64QC-IFGT6juCZ3odQp3B_OAUSCbgZvsMZ1y/exec');
      xhr.send();
    }
    fetchData();
  }, [count]);

  return data;
}

function App() {
  const [count, setCount] = useState(1);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);

  const [improveText, setImproveText] = useState('');
  const [impactText, setImpactText] = useState('');
  const [commentText, setCommentText] = useState('');
  const result = useRemote(count);

  const reset = (comments) => {
    if (comments) {
      logResults(selected, improveText, impactText, commentText);
    } else {
      logResults(selected, '', '', '');
    }
    setStep(0);
    setSelected([]);
    setImproveText('');
    setImpactText('');
    setCommentText('');
  };

  const options = [
    { value: 'publicTrans', label: 'Take public transportation more often.', short: 'Public transportation' },
    { value: 'walkBike', label: 'Walk and ride your bike more often.', short: 'Walk/Bike' },
    { value: 'carpool', label: 'Carpool when possible.', short: 'Carpool' },
    { value: 'limitGas', label: 'Limit the time spent driving your gas-powered vehicle.', short: 'Limit gas vehicle use' },
    { value: 'recycle', label: 'Reduce, reuse, recycle.', short: 'Reduce, reuse, recycle' },
    { value: 'localProduce', label: 'Purchase local produce.', short: 'Local produce' },
    { value: 'localMeat', label: 'Purchase local dairy and meat products.', short: 'Local dairy + meat' },
    { value: 'idleFree', label: 'Be idle free.', short: 'Be idle free' },
    { value: 'burnWood', label: 'Stop burning wood in fireplaces.', short: 'Avoid wood burning' },
    { value: 'tellFriends', label: 'Tell your friends and legislators.', short: 'Friends + legislators' },
    { value: 'unplug', label: 'Unplug devices when not being used.', short: 'Unplug devices' },
    { value: 'weatherproof', label: 'Weatherproof your home.', short: 'Weatherproof home' },
    { value: 'adjustTemp', label: 'Adjust your thermostat to 68° in the winter and 78° in the summer.', short: 'Adjust thermostat' },
    { value: 'eatMeatless', label: 'Eat meatless meals one day a week.', short: 'Meatless meals' },
  ];

  const mapped = {};
  options.forEach(option => { mapped[option.value] = option; });

  let resultMax = 1;
  for (let i = 0; i < options.length; ++i) {
    if (result[options[i].value] > resultMax) { resultMax = result[options[i].value]; }
  }

  const titles = [
    <span>How Will you help<br />clear the air?</span>,
    <span>Pledge to help clear the air</span>,
    <span>I Pledge to...</span>,
    <span>Community Pledging<br/></span>,
    <span>Feedback</span>
  ];

  const content = [
    <div className="QuestionB">Pledge ways that you will help improve air quality in your community</div>,
    <div className="">
      <div className="ChooseThree">Choose 3 or more options</div>
      {options.map(option =>
        <Option
          onChange={setSelected}
          selected={selected}
          key={option.value}
          {...option}
        />
      )}
    </div>,
    <div className="">
      {selected.map((value, idx) => (
        <div className="PledgeLine" key={value}>
          <span className="PledgePoint">{idx + 1}.</span>{mapped[value].label}
        </div>
      ))}
      <div className="ToHelp">...To help clear the air!</div>
    </div>,
    <div className="Community">
      {options.map(option => (
        <div className="CommunityRow" key={option.value}>
          <span className="CommunityItem">{option.short}</span>
          <span
            className="CommunityBar"
            style={{ width: (200 / resultMax) * result[option.value] || 2}}
          />
          <span className="CommunityCount">{result[option.value] || 0}</span>
        </div>
      ))}
    </div>,
    <div className="SurveyBody">
      We would love your feedback on our project so we can help improve the experience in the future.
      <br /><br />
      How could the app's functionality be improved?
      <br />
      <input
        type="text"
        className="SurveyText"
        onChange={e => setImproveText(e.target.value)}
        value={improveText}
      />
      <br />
      How does this impact your view on air quality?
      <br />
      <input
        type="text"
        className="SurveyText"
        onChange={e => setImpactText(e.target.value)}
        value={impactText}
      />
      <br />
      Comments
      <br />
      <input
        type="text"
        className="SurveyText"
        onChange={e => setCommentText(e.target.value)}
        value={commentText}
      />
      <br />
    </div>
  ];

  return (
    <div className="App">
      <div className="Content">
        <div className="Title">Air Quality Pledge</div>
        <div className="Main">
          <div
            className="Question"
            style={{ marginTop:
                step === 3 ? -80 : 0 }}
          >
            {titles[step]}
          </div>
          {content[step] || 'None'}
        </div>
        <div className="Navigation">
          {step === 0 ? (
            <button
              href="#"
              className="ActionButton"
              onClick={() => {
                setCount(count + 1);
                setStep(1);
              }}
            >
              Take the Pledge
            </button>
          ) : step === 1 ? (
            <button
              href="#"
              className="ActionButton OptionSubmit"
              onClick={() => setStep(2)}
              disabled={selected.length < 3}
            >
              Submit
            </button>
          ) : step === 2 ? (
            <React.Fragment>
              <div className="RightAlignButton">
                <button
                  href="#"
                  className="SmallActionButton"
                  onClick={() => setStep(3)}
                >
                  Next
                </button>
              </div>
            </React.Fragment>
          ) : step === 3 ? (
            <React.Fragment>
              <div className="RightAlignButton">
                <button
                  href="#"
                  className="SmallActionButton"
                  onClick={() => setStep(4)}
                >
                  Finish and provide feedback
                </button>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <button
                href="#"
                className="SmallActionUnderline"
                onClick={() => reset(true)}
              >
                Submit
              </button>
              <button
                href="#"
                className="SmallActionButton"
                onClick={() => reset()}
              >
                Skip
              </button>
            </React.Fragment>
        )}
        </div>
      </div>
    </div>
  );
}

export default App;
