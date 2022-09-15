reward_done = getRewards(next_state, action)
      if(reward_done[0] > 0) {
        let frequency = stateFrequenciesMap[`${currentState},${action-agent.actions.length}`]
        reward_done[0] *= frequency
      }