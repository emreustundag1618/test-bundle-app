// The function that handles the data changes
export function isDifferent(oldData: any, newData: any) {
    if (oldData.length !== newData.length) {
      return true;
    }
    for (let i = 0; i < oldData.length; i++) {
      for (let key in oldData[i]) {
        if (oldData[i][key] !== newData[i][key]) {
          return true;
        }
      }
    }
    return false;
  }