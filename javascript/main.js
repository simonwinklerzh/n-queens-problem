/* ==========================================================================
   Queens Problem - Backtracking algorithm
   ========================================================================== */

(function () {

  /* ==========================================================================
     Program
     ========================================================================== */

  /**
   * Shows whether or not a queen is present and if a
   * cell is already attacked by a queen on another cell.
   *
   * @typedef {Object} Queens_cell
   * @property {(0|1)} value
   * @property {string[]} attackers - xy coordinates
   */

  /**
   * @typedef {Queens_value[]} Queens_row
   */

  /**
   * @typedef {Queens_row[]} Queens_board
   */

  /**
   * Meta information
   * @typedef {Object} Queens_info
   * @property {Number} step_count - Shows how many times a queen has been set on the board
   * @property {Number} time - measure the duration
   */

  /**
   * Queens board with meta information
   * @typedef {Object} Queens_board_with_meta
   * @property {Queens_info} meta_info
   * @property {Queens_board} board
   */

  /**
   * @param {Number}
   * @returns {Queens_board}
   */
  function create_initial_board(number_of_queens) {
    const board = [];

    for (let i = 0; i < number_of_queens; i += 1) {
      const row = [];
      for (let i_2 = 0; i_2 < number_of_queens; i_2 += 1) {
        row.push({ value: 0, attackers: [] });
      }
      board.push(row);
    }

    return board;
  }

  /**
   * @param {Number} col_index
   * @param {Queens_board} board
   * @returns {(Queens_board|false)}
   */
  function set_queens(board, row_index) {
    // All queens have been placed
    if (row_index === board.length) {
      return true;
    }

    for (let col_index = 0; col_index < board.length; ++col_index) {
      if (place_is_valid(board, row_index, col_index)) {
        board[row_index][col_index].value = 1;
        if (set_queens(board, row_index + 1)) {
          return board;
        }
        // Backtracking
        board[row_index][col_index].value = 0;
      }
    }

    return false;
  }

  /**
   * @param {Queens_board} board
   * @param {Number} row_index
   * @param {Number} col_index
   * @returns {Boolean}
   */
  function place_is_valid(board, row_index, col_index) {

    // Check if there is already a queen in the same column
    for (let i = 0; i < board.length; i += 1) {
      if (board[i][col_index].value === 1) {
        return false;
      }
    }

    // Check the top left - bottom right diagonal
    for (let i = row_index, j = col_index; i >= 0 && j >= 0; i -= 1, j -= 1) {
      if (board[i][j].value === 1) {
        return false;
      }
    }

    // Check the top right - bottom left diagonal
    for (let i = row_index, j = col_index; i >= 0 && j < board.length; i -= 1, j +=1) {
      if (board[i][j].value === 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param {Queens_board} board
   * @returns {number}
   */
  function get_queens_count(board) {
    return board
      .flat()
      .reduce(function (accumulator, current) {
        return accumulator + current.value;
      }, 0);
  }

  /**
   * @param {Queens_board} board
   * @returns {Queens_board} - a subset of the board, with only free cells
   */
  function get_free_cells(board) {
    return board
      .flat()
      .filter(function (current) {
        if (current.attackers.length === 0) {
          return true;
        }
        return false;
      });
  }

  /**
   * @param {Queens_board}
   * @param {Number} y
   * @returns {Queens_cell[]}
   */
  function get_row(board, y) {
    return board[y];
  }

  /**
   * @param {Queens_board}
   * @param {Number} x
   * @returns {Queens_cell[]}
   */
  function get_col(board, x) {
    return board.map(function (row) {
      return row[x];
    });
  }

  /**
   * @param {Queens_board}
   * @param {Number} x
   * @param {Number} y
   * @returns {Queens_cell[]}
   */
  function get_diagonals(board, x, y) {
    const result = [];

    // To the top left
    for (
      let col_index = x,
      row_index = y;

      col_index >= 0 && row_index >= 0;

      col_index -= 1,
      row_index -= 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the bottom right
    for (
      let col_index = x,
      row_index = y;

      col_index < board.length && row_index < board.length;

      col_index += 1,
      row_index += 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the top right
    for (
      let col_index = x,
      row_index = y;

      col_index < board.length && row_index >= 0;

      col_index += 1,
      row_index -= 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the bottom left
    for (
      let col_index = x,
      row_index = y;

      col_index >= 0 && row_index < board.length;

      col_index -= 1,
      row_index += 1
    ) {
      result.push(board[row_index][col_index]);
    }

    return result;
  }

  /**
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   * @returns {Queens_cell[]}
   */
  function get_neighbours(board, cell) {
    const [x, y] = get_x_y_coordinates(board, cell);
    return [
      ...get_row(board, y),
      ...get_col(board, x),
      ...get_diagonals(board, x, y)
    ];
  }

  /**
   * Mark all fields that are attacked by queen at `x` `y`
   *
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   */
  function mark_attacked_fields(board, cell) {
    cell.value = 1;
    const neighbours = get_neighbours(board, cell);
    const [x, y] = get_x_y_coordinates(board, cell);
    neighbours.forEach(function mark(current) {
      current.attackers.push(`${x}|${y}`);
    });
  }

  /**
   * Unmark all fields that are attacked by queen at `x` `y`
   *
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   */
  function unmark_attacked_fields(board, cell) {
    cell.value = 0;
    const neighbours = get_neighbours(board, cell);
    const [x, y] = get_x_y_coordinates(board, cell);
    neighbours.forEach(function mark(current) {
      current.attackers = current.attackers.filter(function unmark(attacker) {
        return attacker !== `${x}|${y}`;
      });
    });
  }

  /**
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   * @returns {(Number[]|Boolean)}
   */
  function get_x_y_coordinates(board, cell) {
    for (let row_index = 0; row_index < board.length; row_index += 1) {
      if (board[row_index].includes(cell)) {
        return [
          // x
          board[row_index].indexOf(cell),
          // y
          row_index
        ];
      }
    }
    return false;
  }


  /**
   * This is another implementation of the algorithm which sets the
   * queens at a random position. It marks every field that is already
   * attacked by a previously set queen and excludes it from the
   * random cells available to choose from.
   *
   * @param {Queens_board} board
   * @param {Function} step
   * @returns {(Queens_board|false)}
   */
  async function set_queens_random(board, step = null) {
    const queens_count = get_queens_count(board);

    // All queens have been placed
    if (queens_count === board.length) {
      return true;
    }

    const cells = shuffle(get_free_cells(board));

    // Not all queens have been placed, but there are no free cells left
    if (cells.length === 0) {
      return false;
    }

    // There are less remaining free cells than queens to place on the board
    if (cells.length < board.length - queens_count) {
      return false;
    }

    for (let i = 0; i < cells.length; i += 1) {
      const random_cell = cells[i];
      mark_attacked_fields(board, random_cell);

      if (step) {
        await step(board, {
          step_type: 'forward'
        });
      }

      if (await set_queens_random(board, step)) {
        return board;
      }

      // Backtracking
      unmark_attacked_fields(board, random_cell);


      if (step) {
        await step(board, {
          step_type: 'backward'
        });
      }
    }

    return false;
  }


  /* ==========================================================================
     View
     ========================================================================== */

  /**
   * Create a HTML string representing the Sudoku board
   *
   * @param {Queens_board|false} board
   * @param {Queens_info} [meta_info]
   * @returns {string}
   */
  function create_queens_view(board, meta_info = false) {
    if (!board) {
      return `<div class="queens"><p>Keine Lösung gefunden</p></div>`;
    }

    const empty_board = get_queens_count(board) === 0;

    return `
    <div class="queens ${empty_board ? 'queens--loading' : ''}" style="grid-template-columns: repeat(${board.length}, 1fr);">
      ${board.map(function create_row_view(row, row_index) {
        return row.map(function create_cell_view(cell, cell_index) {
          return `<div
            data-index_x="${cell_index}"
            data-index_y="${row_index}"
            data-index="${`${row_index}${cell_index}`}"
            data-value="${cell.value}"
            data-attackers_count="${
              cell.attackers.reduce(function accumulate_attackers (sum) {
                return sum + 1;
              }, 0)
            }"
            class="queens__cell"></div>`;
        }).join('');
      }).join('')}
    </div>
    ${
      meta_info
        ? `<div class="queens-meta">
            ${ 'step_count' in meta_info
              ? `<p class="queens-meta__step-count">
                  <b class="queens-meta__step-count-label">Steps:</b>
                  ${meta_info.step_count}
                </p>`
              : ''
            }
            ${ 'time' in meta_info
              ? `<p class="queens-meta__time">
                  <b class="queens-meta__time-label">Time:</b>
                  ${meta_info.time} ms
                </p>`
              : ''
            }
          </div>`
        : ''
    }
    `;
  }

  /**
   * @param {Queens_board} board
   * @param {String} target - HTML ID
   * @param {Queens_info} [meta_info]
   * @returns {Queens_board}
   */
  function render_demo_queens_problem(target, board, meta_info) {
    document.getElementById(target).innerHTML = create_queens_view(board, meta_info);
    return board;
  }

  /**
   * @async
   * @param {String} target - HTML ID
   * @param {Queens_board} board
   * @returns {Queens_info}
   */
  async function render_and_display_metrics(target, board) {
    let step_count = 0;
    let start_time = window.performance.now();
    render_demo_queens_problem(target, board);
    await wait(0);
    const solved_board = await set_queens_random(
      board,
      async function (board, step_info) {
        await wait(0);
        // Count how many times a queen has been set on the board
        if (step_info && step_info.step_type && step_info.step_type === 'forward') {
          step_count += 1;
        }
      }
    );
    let end_time = window.performance.now();
    let time = end_time - start_time;
    render_demo_queens_problem(target, solved_board, { step_count, time });
    return {
      step_count,
      time
    }
  }


  /**
   * @async
   * @param {String} target - HTML ID
   * @param {Queens_board} board
   * @param {Number} [step_pause] - in miliseconds
   */
  async function render_demo_queens_problem_with_steps(target, board, step_pause = 10) {
    let step_count = 0;
    render_demo_queens_problem(target, board);
    const solved_board = await set_queens_random(
      board,
      async function (board, step_info) {
        // Count how many times a queen has been set on the board
        if (step_info && step_info.step_type && step_info.step_type === 'forward') {
          step_count += 1;
        }
        await wait(step_pause);
        render_demo_queens_problem(target, board, { step_count });
      }
    );
    render_demo_queens_problem(target, solved_board, { step_count });
  }

  /**
   * @async
   */
  async function render_tests() {
    // Render visualised algorithm
    await render_demo_queens_problem_with_steps('queens-target-1', create_initial_board(9), 0);
    // Render solution without visualisation of the process
    // await render_and_display_metrics('queens-target-2', create_initial_board(6));
  }

  /**
   * @param {Queens_board}
   */
  function print_queens_to_console(board) {
    console.table(board.map(row => row.map(cell => cell.value)));
  }

}());
