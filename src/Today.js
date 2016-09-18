// @flow
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ListView,
  Text,
} from 'react-native';
import {
  Content,
  Text as NBText,
  Spinner,
} from 'native-base';

import moment from 'moment';
import 'moment/locale/fi';

import { fetchLessons } from '../api';
import { parseReservation, lessonsToMap } from '../utils';

const TodayDataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1.id !== r2.id,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});


type Props = {};
type State = {
  loading: boolean;
};

export default class Today extends Component<*, Props, State> {
  props: Props;
  todayDataSource: Object;

  renderRow: Function;
  renderSectionHeader: Function;

  constructor(props: Props) {
    super(props);

    this.state = {
      // lessons: [],
      loading: true,
    };

    this.todayDataSource = TodayDataSource.cloneWithRowsAndSections({});

    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
  }

  state: State;

  componentDidMount() {
    fetchLessons({ studentGroup: ['14TIKOOT'], type: 'today' })
      .then((data) => {
        if (!data.reservations || data.reservations.length === 0) {
          this.setState({ loading: false });
          return;
        }
        const lessons: Array<Lesson> = data.reservations
          .map(reservation => parseReservation(reservation))
          .sort((a, b) => moment(a.startDate).isBefore(b.startDate));
        this.todayDataSource = TodayDataSource.cloneWithRowsAndSections(lessonsToMap(lessons));
        this.setState({ loading: false });
      })
      .catch(error => console.error(error) || this.setState({ loading: true }));
  }

  renderRow(lesson: Lesson) {
    return (
      <View style={styles.row} key={lesson.id}>
        <View style={styles.rowDates}>
          <Text style={styles.timeText}>{moment(lesson.startDate).format('HH:mm')}</Text>
          <Text style={styles.timeTextDivider}>-</Text>
          <Text style={styles.timeText}>{moment(lesson.endDate).format('HH:mm')}</Text>
        </View>
        <View
          style={styles.rowCenter}
        >
          <Text style={styles.courseNameText}>{lesson.course.name}</Text>
          <Text style={styles.roomNameText}>{lesson.room}</Text>
        </View>
      </View>
    );
  }

  renderSectionHeader(sectionData: Lesson, sectionId: string) {
    return (
      <View key={sectionId} style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{sectionId}</Text>
      </View>
    );
  }

  render(): React.Element<*> {
    const noLessons: boolean = !this.state.loading && this.todayDataSource.getRowCount() === 0;
    const loading: boolean = this.state.loading;
    return (
      <Content>
        <ListView
          renderRow={this.renderRow}
          dataSource={this.todayDataSource}
          initialListSize={0}
          pageSize={8}
          scrollRenderAheadDistance={1000}
          renderSeparator={(sID, rID) =>
            <View style={styles.separator} key={`${sID}-${rID}`} />
          }
          renderSectionHeader={this.renderSectionHeader}
          style={styles.listView}
        />
        {noLessons &&
          <View style={styles.noLessonsContainer}>
            <NBText>No lessons today...</NBText>
          </View>
        }
        {loading && <Spinner />}
      </Content>
    );
  }

}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingVertical: 4,
  },
  listView: {
    flex: 1,
    flexDirection: 'column',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginLeft: 8,
  },
  sectionHeader: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    color: 'rgba(0, 0, 0, 0.87)',

  },
  rowDates: {
    alignItems: 'center',
  },
  rowCenter: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  roomNameText: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  courseNameText: {
    color: 'rgba(0, 0, 0, 0.87)',
  },
  timeText: {
    color: 'rgba(0, 0, 0, 0.87)',
  },
  timeTextDivider: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  noLessonsContainer: {
    marginHorizontal: 8,
    marginTop: 16,
    alignItems: 'center',
  },
});