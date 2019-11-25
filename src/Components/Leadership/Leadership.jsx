import React from 'react';
import '../../main.css';
import './Leadership.css';

import withScreenSize from '../HOC/ScreenSize';
import PageTitle from '../Util/PageTitle';
import LeadershipBar from './LeadershipBar';
import BoardMember from './BoardMember';
const boardMemberArray = require('./BoardMembers.js');

class Leadership extends React.Component {
  constructor(props) {
    super(props);

    // Parent div of all the board members.
    this.boardMembersRef = React.createRef();

    this.getMemberInFocus = this.getMemberInFocus.bind(this);
    this.buildHeightArray = this.buildHeightArray.bind(this);
    this.goToSubteam = this.goToSubteam.bind(this);

    this.subteamMap = new Map([['Co-President', 'Presidents'], ['Co-Events Chair', 'Events'],
    ['Co-Outreach Chair', 'Outreach'], ['Co-Design Chair', 'Design'],
    ['Professional Development Chair', 'Professional'], ['Co-Corporate Chair', 'Corporate'],
    ['Operations Chair', 'Operations'], ['Secretary', 'Secretary'], ['Co-Mentorship Chair', 'Mentorship'],
    ['CS Academic Chair', 'Academic'], ['IS Academic Chair', 'Academic'],
    ['Co-PR and Alumni Chair', 'PR & Alumni'], ['Floater', 'Floater']])

    this.state = {
      divHeight: 0,
      selectedSubteam: 'Presidents',
      memberInFocus: 1,
      heightArray: [], // Stores offsetTop position of member as well member object.
      lastChildMarginBottom: 0,
      automaticScroll: false
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.buildHeightArray);
    this.buildHeightArray();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.buildHeightArray);
  }

  buildHeightArray() {
    const MARGIN_BOTTOM = 25; // For each board member div.

    // Total height of the parent div of the board members.
    let divHeight = window.innerHeight - this.boardMembersRef.current.offsetTop;

    let arr = [];
    let arrLength = this.boardMembersRef.current.children.length;

    let i = 0;

    for (let child of this.boardMembersRef.current.children) {
      let offsetTop;

      // Case: First Child
      if (i === 0) offsetTop = child.offsetHeight + MARGIN_BOTTOM;

      // Case: Last Child
      else if (i === arrLength - 1) {
        offsetTop = child.offsetHeight + this.state.lastChildMarginBottom;

        if (child.offsetHeight < this.state.divHeight) {
          let marginBottom = this.state.divHeight - child.offsetHeight;
          offsetTop += marginBottom;

          this.setState({ lastChildMarginBottom: marginBottom });
        } else {
          offsetTop += MARGIN_BOTTOM;
        }
      }

      // Case: All Other Children
      else offsetTop = arr[i - 1][0] + child.offsetHeight + MARGIN_BOTTOM;

      let member = this.findReactElement(child).props.person;
      arr.push([offsetTop, member]);

      i++;
    }

    this.setState({
      heightArray: arr,
      divHeight: divHeight
    });
  }

  getMemberInFocus() {
    if (this.state.automaticScroll) return; // Don't scroll if already using JS scrollIntoView function.

    let scrollPosition = this.boardMembersRef.current.scrollTop;
    let heightArray = this.state.heightArray;

    let i = 0;

    while (i < heightArray.length) {
      if (scrollPosition < heightArray[i][0]) break;

      i++;
    }

    let member = heightArray[i][1];

    this.setState({
      selectedSubteam: this.subteamMap.get(member.position),
      memberInFocus: member.id
    });
  }

  findReactElement(node) {
    for (var key in node) {
      if (key.startsWith("__reactInternalInstance$")) {
        return node[key]._debugOwner.stateNode;
      }
    }

    return null;
  }

  goToSubteam(subteam) {
    let heightArray = this.state.heightArray;

    let i = 0;

    while (i < heightArray.length) {
      if (this.subteamMap.get(heightArray[i][1].position) === subteam) {
        let element = document.getElementById(heightArray[i][1].id);
        element.classList.add('selectedBg');

        this.setState({
          selectedSubteam: subteam,
          memberInFocus: heightArray[i][1].id,
          automaticScroll: true
        }, async () => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            element.classList.remove('selectedBg');
            this.setState({ automaticScroll: false });
          }, 1000);
        });
        break;
      }

      i++;
    }
  }

  isSafariBrowser() {
    let userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1) {
      return true;
    }

    return false;
  }

  render() {

    let breakpoint = this.props.breakpoint;

    let subteams = [];
    let subteamSet = new Set();

    let boardMembers = [];
    let i = 0;

    for (let boardMember of boardMemberArray) {
      let subteam = this.subteamMap.get(boardMember.position);

      if (!subteamSet.has(subteam)) {
        subteams.push(subteam);
        subteamSet.add(subteam);
      }

      boardMembers.push(
        <BoardMember person={boardMember} key={i} />
      )

      i += 1;
    }

    let boardMembersClasses = breakpoint !== 'M' ? 'horizontalMargin50px overflowScroll' : '';
    let boardMembersPosition = breakpoint !== 'D' ? 'positionAbsolute overflowScroll' : '';
    let bodyClasses = breakpoint === 'D' ? 'maxWidth75P' : '';

    let isSafariBrowser = this.isSafariBrowser();
    let updatedHeight = isSafariBrowser ? null : this.state.divHeight;

    return (
      <div>
        <PageTitle title="2019-2020 Executive Board Members" />

        <div className={`flexSpaceBetween fontFamilyRalewayB marginTop25px marginAuto
          ${bodyClasses}`}>

          {
            breakpoint === 'D' && !isSafariBrowser ?
              <LeadershipBar goToSubteam={this.goToSubteam}
                selectedSubteam={this.state.selectedSubteam}
                subteams={subteams} />
              :
              null
          }

          <div ref={this.boardMembersRef}
            className={`displayFlex flexColumn ${boardMembersClasses} ${boardMembersPosition}`}
            style={{ height: updatedHeight }} onScroll={this.getMemberInFocus}>

            {boardMembers}

          </div>
        </div>
      </div>
    )
  };
};

export default withScreenSize(Leadership);